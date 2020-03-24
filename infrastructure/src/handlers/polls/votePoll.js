const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');

module.exports = (app) => {
    app.options('/v1/polls', auth.cors, () => {
    });

    app.post('/v1/polls/:pollId/vote', auth.required, auth.cors, async (req, res) => {
        console.log("votePoll handler starts");

        try {
            const dbClient = await mongo.connectToDatabase();
            console.log("Mongo connected");

            return api.sendCreated(res, api.createResponse());
        } catch (err) {
            console.log("Request failed", err);
            return api.sendInternalError(res, api.createError('Failed to vote in polls', "sign-in.something-went-wrong"));
        }
    });
};
// "age": userData.Item.born ? new Date().getFullYear() - parseInt(userData.Item.born) : null,
// "drivingFor": userData.Item.drivingSince ? new Date().getFullYear() - parseInt(userData.Item.drivingSince) : null,
