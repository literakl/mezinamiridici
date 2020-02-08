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
                return api.sendErrorForbidden(callback, api.createError("Bad credentials", "sign-in.auth-error"));
            }

            if (! user.auth.verified) {
                return api.sendErrorForbidden(callback, api.createError("User not verified", "sign-in.auth-not-verified"));
            }

            // following part takes more than 1 second with 128 MB RAM!
            if (bcrypt.compareSync(password, user.auth.pwdHash)) {
                console.log("Password verified");
                const token = jwt.sign({"userId": user.auth._id, "nickname": user.bio.nickname}, process.env.JWT_SECRET);
                console.log("All good");
                return api.sendRresponse(callback, api.createResponse(token));
            } else {
                console.log("Password mismatch for user " + user._id);
                return api.sendErrorForbidden(callback, api.createError("Bad credentials", "sign-in.auth-error"));
            }
        })
        .catch(err => {
            console.log("Request failed", err);
            return api.sendInternalError(callback, api.createError('Failed to authorize the user', "sign-in.something-went-wrong"));
        });
};

function findUser(dbClient, email) {
    console.log("findUser");
    return dbClient.db()
        .collection("users")
        .findOne({ "auth.email": email })
        .then(doc => {
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
