const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');

module.exports = (app) => {
    app.get('/v1/polls/:pollId', auth.optional, async (req, res) => {
        console.log("getPoll handler starts");

        try {
            const dbClient = await mongo.connectToDatabase();
            console.log("Mongo connected");

            return api.sendCreated(res, api.createResponse());
        } catch (err) {
            console.log("Request failed", err);
            return api.sendInternalError(res, api.createError('Failed to get polls', "sign-in.something-went-wrong"));
        }
    })
};