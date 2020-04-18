const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require("../../utils/logging");

module.exports = (app) => {
    app.options('/bff/polls/last', auth.cors);
    app.options('/bff/polls/:slug', auth.cors);

    app.get('/bff/polls/last', auth.optional, async (req, res) => {
        logger.verbose("getLastPoll handler starts");
        try {
            const dbClient = await mongo.connectToDatabase();
            logger.debug("Mongo connected");

            const pipeline = [mongo.stagePublished, mongo.stageSortByDateDesc, mongo.stageLimit(1), mongo.stageLookupPoll];
            if (req.identity) {
                pipeline.push(mongo.stageMyVote(req.identity.userId));
            }
            const item = await mongo.getPoll(dbClient, pipeline);
            logger.debug("Item fetched");

            return api.sendCreated(res, api.createResponse(item));
        } catch (err) {
            logger.error("Request failed", err);
            return api.sendInternalError(res, api.createError('Failed to get polls', "sign-in.something-went-wrong"));
        }
    });

    app.get('/bff/polls/:slug', auth.optional, async (req, res) => {
        logger.verbose("getPoll handler starts");
        const { slug } = req.params;
        if (! slug) {
            return api.sendBadRequest(res, api.createError("Missing poll slug", "generic.internal-error"));
        }

        try {
            const dbClient = await mongo.connectToDatabase();
            logger.debug("Mongo connected");

            const pipeline = [mongo.stageSlug(slug), mongo.stageLookupPoll];
            if (req.identity) {
                // noinspection JSCheckFunctionSignatures
                pipeline.push(mongo.stageMyVote(req.identity.userId));
            }
            const item = await mongo.getPoll(dbClient, pipeline);
            logger.debug("Items fetched");

            return (item) ? api.sendCreated(res, api.createResponse(item)): api.sendNotFound(res, api.createError());
        } catch (err) {
            logger.error("Request failed", err);
            return api.sendInternalError(res, api.createError('Failed to get polls', "sign-in.something-went-wrong"));
        }
    })
};