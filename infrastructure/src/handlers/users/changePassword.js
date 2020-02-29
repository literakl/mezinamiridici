const bcrypt = require('bcryptjs');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');

exports.handler = async (payload, context, callback) => {
    console.log("handler starts");
    if (payload.body === undefined || payload.body === null) {
        return api.sendBadRequest(callback, api.createError('body is null', "sign-up.something-went-wrong"));
    }
    const userId = payload.pathParameters.userId;

    console.log(context);
    //todo overit, zda funguje autorizace spravne. co se stane, kdyz chybi nebo je volana na jineho uzivatele?

    // This freezes node event loop when callback is invoked
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        const dbClient = await mongo.connectToDatabase();
        console.log("Mongo connected");

        const {currentPassword, newPassword} = JSON.parse(payload.body);
        if (!newPassword || newPassword.length < 6) {
            let result = {"success": false};
            api.addValidationError(result, "password", "Missing or short password", "sign-up.password-required");
            return api.sendErrorForbidden(callback, result);
        }

        const user = await mongo.findUser(dbClient, {userId: userId}, {projection: {auth: 1, "bio.nickname": 1}});
        if (!user) {
            return api.sendErrorForbidden(callback, api.createError("User not found", "sign-in.auth-error"));
        }

        // following part takes more than 1 second with 128 MB RAM!
        if (!bcrypt.compareSync(currentPassword, user.auth.pwdHash)) {
            console.log("Password mismatch for user " + user._id);
            return api.sendErrorForbidden(callback, api.createError("Bad credentials", "sign-in.auth-error"));
        }

        const date = new Date();
        const query = prepareChangePasswordQuery(newPassword, date);
        await dbClient.db().collection("users").updateOne({_id: userId}, query);
        user.auth.pwdTimestamp = date;
        const token = api.createTokenFromUser(user);
        return api.sendRresponse(callback, api.createResponse(token));
    } catch (err) {
        console.log("Request failed", err);
        return api.sendInternalError(callback, api.createError('failed to update the user', "sign-up.something-went-wrong"));
    }
};

const prepareChangePasswordQuery = (password, date) => {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    let query = { $set: { } };
    query.$set['auth.pwdHash'] = passwordHash;
    query.$set['auth.pwdTimestamp'] = date;
    return query;
};
