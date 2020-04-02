const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');

module.exports = (app) => {
    app.options('/bff/polls/last', auth.cors, () => {});
    app.options('/bff/polls/:slug', auth.cors, () => {});

    app.get('/bff/polls/last', auth.optional, async (req, res) => {
        console.log("getLastPoll handler starts");
        try {
            const dbClient = await mongo.connectToDatabase();
            const pipeline = [mongo.stagePublished, mongo.stageSortByDateDesc, mongo.stageLimit(1), mongo.stageLookupPoll];
            const item = await mongo.getPoll(dbClient, pipeline);
            return api.sendCreated(res, api.createResponse(item));
        } catch (err) {
            console.log("Request failed", err);
            return api.sendInternalError(res, api.createError('Failed to get polls', "sign-in.something-went-wrong"));
        }
    });

    app.get('/bff/polls/:slug', auth.optional, async (req, res) => {
        console.log("getPoll handler starts");
        const { slug } = req.params;
        if (! slug) {
            return api.sendBadRequest(res, api.createError("Missing slug id", "generic.internal-error"));
        }

        try {
            const dbClient = await mongo.connectToDatabase();
            const pipeline = [mongo.stageSlug(slug), mongo.stageLookupPoll];
            const item = await mongo.getPoll(dbClient, pipeline);
            return api.sendCreated(res, api.createResponse(item));
        } catch (err) {
            console.log("Request failed", err);
            return api.sendInternalError(res, api.createError('Failed to get polls', "sign-in.something-went-wrong"));
        }
    })
};