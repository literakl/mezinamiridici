const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');

exports.handler = (payload, context, callback) => {
    console.log("handler starts");
    const { email, password } = JSON.parse(payload.body);
    let result = validateParameters(email, password);
    if (! result.success) {
        return api.sendBadRequest(callback, result);
    }

    // This freezes node event loop when callback is invoked
    context.callbackWaitsForEmptyEventLoop = false;

    // todo user nor found case
    mongo.connectToDatabase()
        .then(db => {
            console.log("Mongo connected");
            return findUser(db, email);
        })
        .then(user => {
            console.log("User checks");
            if (!user) {
                console.log("User not found " + email);
                return api.sendErrorForbidden(callback, api.createError(2004, "Bad credentials"));
            }

            if (! user.auth.verified) {
                return api.sendErrorForbidden(callback, api.createError(2003, "User not verified"));
            }

            // following part takes more than 1 second with 128 MB RAM!
            if (bcrypt.compareSync(password, user.password)) {
                console.log("Password verified");
                const token = jwt.sign({"userId": user.email,"nickname": user.nickname}, process.env.JWT_SECRET);
                console.log("All good");
                return api.sendRresponse(callback, api.createResponse(token));
            } else {
                console.log("Password mismatch for user " + user._id);
                return api.sendErrorForbidden(callback, api.createError(2004, "Bad credentials"));
            }
        })
        .catch(err => {
            console.log("Request failed", err);
            return api.sendInternalError(callback, api.createError(2003, err.Item));
        });
};

function findUser(dbClient, email) {
    console.log("findUser");
    return dbClient.db()
        .collection("users")
        .findOne({ email: email })
        .then(doc => {
            console.log("findUser mongo responded: " + doc);
            return doc;
        });
}

const validateParameters = (email, password) => {
    let result = { "success": true };
    if (!email) {
        result.success = false;
        api.addValidationError(result, 1000, "email", "Missing email");
    } else {
        if (email.indexOf("@") === -1 || email.indexOf(".") === -1) {
            result.success = false;
            api.addValidationError(result, 1001, "email", "Invalid email");
        }
    }
    if (!password) {
        result.success = false;
        api.addValidationError(result, 1000, "password", "Missing password");
    }
    return result;
};
