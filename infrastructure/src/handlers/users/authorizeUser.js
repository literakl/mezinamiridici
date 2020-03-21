const bcrypt = require('bcryptjs');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');

module.exports = (app) => {
    app.options('/v1/authorizeUser', api.corsOptions, () => {});

    app.post('/v1/authorizeUser', api.corsOptions, async (req, res) => {
        console.log("authorizeUser handler starts");
        const { email, password } = req.body;
        let result = validateParameters(email, password);
        if (! result.success) {
            return api.sendBadRequest(res, result);
        }

        try {
            const dbClient = await mongo.connectToDatabase();
            console.log("Mongo connected");

            const user = await mongo.findUser(dbClient, {email: email}, {projection: { auth: 1, "bio.nickname": 1 }});
            console.log("User checks");
            if (!user) {
                console.log("User not found " + email);
                return api.sendErrorForbidden(res, api.createError("Bad credentials", "sign-in.auth-error"));
            }

            if (!user.auth.verified) {
                return api.sendErrorForbidden(res, api.createError("User not verified", "sign-in.auth-not-verified"));
            }

            // following part takes more than 1 second with 128 MB RAM!
            if (bcrypt.compareSync(password, user.auth.pwdHash)) {
                console.log("Password verified");
                const token = api.createTokenFromUser(user);
                return api.sendRresponse(res, api.createResponse(token));
            } else {
                console.log("Password mismatch for user " + user._id);
                return api.sendErrorForbidden(res, api.createError("Bad credentials", "sign-in.auth-error"));
            }
        } catch (err) {
            console.log("Request failed", err);
            return api.sendInternalError(res, api.createError('Failed to authorize the user', "sign-in.something-went-wrong"));
        }
    })
};

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
