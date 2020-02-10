const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');

exports.handler = (payload, context, callback) => {
    console.log("handler starts");
    console.log(payload);
    console.log(context);
    const userId = payload.pathParameters.userId;
    if (! userId) {
        return api.sendBadRequest(callback, api.createError("Missing user id", "generic.internal-error"));
    }

    // This freezes node event loop when callback is invoked
    context.callbackWaitsForEmptyEventLoop = false;

    mongo.connectToDatabase()
        .then(dbClient => {
            console.log("Mongo connected");
            return mongo.findUser(dbClient, {userId: userId}, {projection: { auth: 0, "prefs.email": 0, consent: 0 }});
        })
        .then(user => {
            console.log("User fetched");
            if (!user) {
                return api.sendErrorForbidden(callback, api.createError("User not found", "profile.user-not-found"));
            }
            // todo check user rights - signed user can see everything, other user cannot see email and profile data, unless profile is public
            return api.sendRresponse(callback, api.createResponse(user));
            // return api.sendRresponse(callback, api.createResponse(user), "public, max-age=600");
        })
        .catch(err => {
            console.log("Request failed", err);
            return api.sendInternalError(callback, api.createError('Failed to load  the user', "generic.something-went-wrong"));
        });
};