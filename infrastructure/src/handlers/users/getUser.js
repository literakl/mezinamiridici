const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');

module.exports = app => {
    app.options('/v1/users/:userId', auth.cors, () => {});

    app.get('/v1/users/:userId', auth.optional, async (req, res) => {
        console.log("getUser handler starts");
        const { userId } = req.params;
        if (! userId) {
            return api.sendBadRequest(res, api.createError("Missing user id", "generic.internal-error"));
        }

        try {
            const dbClient = await mongo.connectToDatabase();
            console.log("Mongo connected");

            const user = await mongo.findUser(dbClient, {userId: userId}, {projection: {auth: 0, "prefs.email": 0, consent: 0}});
            console.log("User fetched");
            if (!user) {
                return api.sendErrorForbidden(res, api.createError("User not found", "profile.user-not-found"));
            }

            if ((!req.identity || req.identity.userId !== userId) && !user.prefs.public) {
                console.log('not authorized');
                user.bio = { nickname: user.bio.nickname };
                delete user.driving;
                delete user.prefs;
            }
            return api.sendRresponse(res, api.createResponse(user));
            // return api.sendRresponse(callback, api.createResponse(user), "public, max-age=600");
        } catch (err) {
            console.log("Request failed", err);
            return api.sendInternalError(res, api.createError('Failed to load  the user', "generic.something-went-wrong"));
        }
    });
};