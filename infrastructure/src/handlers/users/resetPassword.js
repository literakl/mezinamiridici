const bcrypt = require('bcryptjs');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');

exports.handler = async (payload, context, callback) => {
    console.log("handler starts");
    const { resetPasswordToken, password } = JSON.parse(payload.body);

    if (!resetPasswordToken) {
        return api.sendBadRequest(callback, api.createError("Missing token", "sign-in.auth-error"));
    }

    // This freezes node event loop when callback is invoked
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        const dbClient = await mongo.connectToDatabase();
        console.log("Mongo connected");

        const user = await mongo.findUser(dbClient, {"resetPasswordToken": resetPasswordToken}, {projection: { auth: 1, "bio.nickname": 1}});
        console.log("User checks");
        if (!user) {
            console.log("User not found");
            return api.sendErrorForbidden(callback, api.createError("Token not found", "sign-in.invalid-reset"));
        }
        const now = new Date();
        if (user.auth.reset.expires < now) {
            return api.sendErrorForbidden(callback, api.createError("Invalid or expired web token", "sign-in.expired-reset"));
        }

        const query = prepareChangePasswordQuery(password, now);
        dbClient.db().collection("users").updateOne({_id: user._id}, query);
        console.log(`Password changed for user ${user.auth.email}`);

        user.auth.pwdTimestamp = now;
        const token = api.createTokenFromUser(user);
        return api.sendRresponse(callback, api.createResponse(token));
    } catch (err) {
        console.log("Request failed", err);
        return api.sendInternalError(callback, api.createError('Failed to reset the password', "sign-in.something-went-wrong"));
    }
};

const prepareChangePasswordQuery = (password, date) => {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    let query = { $set: { }, $unset: { } };
    query.$set['auth.pwdHash'] = passwordHash;
    query.$set['auth.pwdTimestamp'] = date;
    query.$unset['auth.reset'] = '';
    return query;
};
