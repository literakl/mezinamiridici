const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');

const sortStage = {$sort: {"info.date": -1}};
const limitStage = {$limit: 1};
const lookupStage = {
    $lookup: {
        from: 'polls',
        localField: '_id',
        foreignField: '_id',
        as: 'poll'
    }
};
const lastPollPipeline = [{$match: {"info.published": true}}, sortStage, limitStage, lookupStage];

module.exports = (app) => {
    app.options('/bff/polls/last', auth.cors, () => {});
    app.options('/bff/polls/:slug', auth.cors, () => {});

    app.get('/bff/polls/last', auth.optional, async (req, res) => {
        console.log("getLastPoll handler starts");
        try {
            const dbClient = await mongo.connectToDatabase();
            const cursor = dbClient.db().collection("items").aggregate(lastPollPipeline);
            const item = await cursor.next();
            item.poll = item.poll[0];
            item.poll.votes.total = item.poll.votes.neutral + item.poll.votes.trivial + item.poll.votes.dislike + item.poll.votes.hate;
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
            const slugPipeline = [{$match: {"info.slug": slug}}, sortStage, limitStage, lookupStage];
            const cursor = dbClient.db().collection("items").aggregate(slugPipeline);
            const poll = await cursor.next();
            return api.sendCreated(res, api.createResponse(poll));
        } catch (err) {
            console.log("Request failed", err);
            return api.sendInternalError(res, api.createError('Failed to get polls', "sign-in.something-went-wrong"));
        }
    })
};