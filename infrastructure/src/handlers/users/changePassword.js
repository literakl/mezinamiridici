const bcrypt = require('bcryptjs');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');

module.exports = (app) => {
    app.options('/v1/users/:userId/password', auth.cors, () => {});

    app.patch('/v1/users/:userId/password', auth.required, auth.cors, async (req, res) => {
        console.log("changePassword handler starts");
        const { userId } = req.params;
        if (req.identity.userId !== userId) {
            console.log(`JWT token = ${req.identity.userId} but URL userId = ${userId}!`);
            return api.sendErrorForbidden(res, api.createError("JWT mismatch", "sign-in.auth-error"));
        }

        try {
            const dbClient = await mongo.connectToDatabase();
            console.log("Mongo connected");

            const { currentPassword, newPassword } = req.body;
            if (!newPassword || newPassword.length < 6) {
                let result = {"success": false};
                api.addValidationError(result, "password", "Missing or short password", "sign-up.password-required");
                return api.sendErrorForbidden(res, result);
            }

            const user = await mongo.findUser(dbClient, {userId: userId}, {projection: {auth: 1, "bio.nickname": 1}});
            if (!user) {
                return api.sendErrorForbidden(res, api.createError("User not found", "sign-in.auth-error"));
            }

            // following part takes more than 1 second with 128 MB RAM!
            if (!bcrypt.compareSync(currentPassword, user.auth.pwdHash)) {
                console.log("Password mismatch for user " + user._id);
                return api.sendErrorForbidden(res, api.createError("Bad credentials", "sign-in.auth-error"));
            }

            const date = new Date();
            const query = prepareChangePasswordQuery(newPassword, date);
            await dbClient.db().collection("users").updateOne({_id: userId}, query);
            user.auth.pwdTimestamp = date;
            const token = auth.createTokenFromUser(user);
            return api.sendRresponse(res, api.createResponse(token));
        } catch (err) {
            // eslint-disable-next-line no-console
            console.log("Request failed", err);
            return api.sendInternalError(res, api.createError('failed to update the user', "sign-up.something-went-wrong"));
        }
    })
};

const prepareChangePasswordQuery = (password, date) => {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    let query = { $set: { } };
    query.$set['auth.pwdHash'] = passwordHash;
    query.$set['auth.pwdTimestamp'] = date;
    return query;
};
