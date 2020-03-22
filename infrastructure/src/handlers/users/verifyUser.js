const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');

module.exports = (app) => {
    app.options('/v1/verify/:token', auth.cors, () => {});

    app.post('/v1/verify/:token', auth.cors, async (req, res) => {
        console.log("verifyUser handler starts");
        const { token } = req.params;

        try {
            const dbClient = await mongo.connectToDatabase();
            console.log("Mongo connected");

            const user = await mongo.findUser(dbClient, {token: token}, {projection: { auth: 1 }});
            if (!user) {
                return api.sendErrorForbidden(res, api.createError('user has already been verified', "sign-up.already-verified"));
            }

            await verifyUser(dbClient, user);
            return api.sendRresponse(res, api.createResponse("OK"));
        } catch (err) {
            console.log("error", err);
            if (err.success === false) {
                return api.sendErrorForbidden(res, err);
            } else {
                return api.sendInternalError(res, api.createError('failed to verify new user', "sign-up.something-went-wrong"));
            }
        }
    })
};

function verifyUser(dbClient, user) {
    if (!!user.auth.verified) {
        throw api.createError('user has already been verified', "sign-up.already-verified");
    }

    let query = { $set: { }, $unset: { } };
    query.$set['auth.verified'] = true;
    query.$unset['auth.verifyToken'] = '';
    return dbClient.db().collection("users").updateOne({_id: user._id}, query);
}