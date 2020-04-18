const slugify = require('slugify');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require("../../utils/logging");

module.exports = (app) => {
    app.options('/v1/polls', auth.cors);

    app.post('/v1/polls', auth.required, auth.poll_admin, auth.cors, async (req, res) => {
        logger.verbose("createPoll handler starts");
        const { text } = req.body;
        if (!text) {
            return api.sendBadRequest(res, api.createError("Missing parameter", "generic.internal-error"));
        }

        try {
            const dbClient = await mongo.connectToDatabase();
            logger.debug("Mongo connected");

            const pollId = mongo.generateTimeId();
            await insertPoll(dbClient, pollId);
            await insertItem(dbClient, text, pollId, req.identity);
            logger.debug("Item inserted");

            const pipeline = [mongo.stageId(pollId), mongo.stageLookupPoll];
            const item = await mongo.getPoll(dbClient, pipeline);
            logger.debug("Poll fetched");

            return api.sendCreated(res, api.createResponse(item));
        } catch (err) {
            logger.error("Request failed", err);
            return api.sendInternalError(res, api.createError('Failed to create poll', "sign-in.something-went-wrong"));
        }
    })
};

function insertPoll(dbClient, pollId) {
    const poll = {
        "_id" : pollId,
        "votes": {
            "neutral": 0,
            "trivial": 0,
            "dislike": 0,
            "hate": 0
        }
    };

    return dbClient.db().collection("polls").insertOne(poll);
}

function insertItem(dbClient, text, pollId, identity) {
    const slug = slugify(text, { lower: true, strict: true });
    const item = {
        "_id" : pollId,
        "type": "poll",
        "votes_count": 0,
        "info": {
            "author": {
                "nickname": identity.nickname,
                "id": identity.userId
            },
            "caption": text,
            "slug": slug,
            "published": true,
            "date": new Date(),
            // "picture":  "car75.png", TODO
            "tags": ["polls"] // TODO
        },
    };

    return dbClient.db().collection("items").insertOne(item);
}
