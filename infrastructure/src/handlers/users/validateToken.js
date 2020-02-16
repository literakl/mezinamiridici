const jwt = require('jsonwebtoken');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');

exports.handler = (payload, context, callback) => {
    console.log("handler starts");
    console.log(payload.body);
    const { jwtToken } = JSON.parse(payload.body);
    console.log(jwtToken);
    if (! jwtToken) {
        return api.sendBadRequest(callback, api.createError("Missing user id", "generic.internal-error"));
    }

    let jwtData;
    try {
        jwtData = jwt.verify(jwtToken, process.env.JWT_SECRET);
    } catch (err) {
        return api.sendErrorForbidden(callback, api.createError("Invalid or expired web token", null));
    }

    // This freezes node event loop when callback is invoked
    context.callbackWaitsForEmptyEventLoop = false;

    mongo.connectToDatabase()
        .then(dbClient => {
            console.log("Mongo connected");
            return mongo.findUser(dbClient, {userId: jwtData.userId}, {projection: { auth: 1 }});
        })
        .then(user => {
            console.log("User checks");
            if (!user) {
                console.log("User not found " + jwtData.userId);
                return api.sendErrorForbidden(callback, api.createError("User does not exist", "sign-in.auth-error"));
            }
            if (Date.parse(jwtData.pwdTimestamp) <= Date.parse(user.auth.pwdTimestamp)) {
                return api.sendErrorForbidden(callback, api.createError("Obsolete password", "sign-in.obsolete-password"));
            }
            delete jwtData.exp;
            const token = jwt.sign(jwtData, process.env.JWT_SECRET, {expiresIn: '31d'});
            return api.sendRresponse(callback, api.createResponse(token));
        })
        .catch(err => {
            console.log("Request failed", err);
            return api.sendInternalError(callback, api.createError('Failed to verify token', "generic.something-went-wrong"));
        });
};
