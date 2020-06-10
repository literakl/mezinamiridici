const slugify = require('slugify');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require("../../utils/logging");

module.exports = (app) => {
    app.options('/v1/polls/:pollId/comment', auth.cors);

    app.post('/v1/polls/:pollId/comment', auth.required, auth.cors, async (req, res) => {
        logger.verbose("createComment handler starts");
        const { commentText, parentId } = req.body;
        const { pollId } = req.params;
        if (!pollId || !commentText) {
            return api.sendBadRequest(res, api.createError("Missing parameter", "generic.internal-error"));
        }

        try {
            const dbClient = await mongo.connectToDatabase();
            logger.debug("Mongo connected");

            let item = await dbClient.db().collection("items").findOne({ _id: pollId }, { projection: { _id: 1 } });
            if (!item) {
                return api.sendNotFound(res, api.createError("Poll not found", "generic.internal-error"));
            }
            logger.debug("Item fetched");
            const commentId = mongo.generateId();
            await insertComment(dbClient, pollId, commentId, commentText, req.identity, parentId);
            logger.debug("Item inserted");

            let comment = await dbClient.db().collection("comments").findOne({ _id: commentId });

            return api.sendCreated(res, api.createResponse(comment));
        } catch (err) {
            logger.error("Request failed", err);
            return api.sendInternalError(res, api.createError('Failed to create poll', "sign-in.something-went-wrong"));
        }
    })
};

function insertComment(dbClient, pollId, commentId, commentText, user, parentId) {
    var comment = {
        _id: commentId,
        pollId: pollId,
        commentText: commentText,
        created: new Date(),
        upvotes: 0,
        downvotes: 0,
        author: {
            userId: user.userId,
            nickname: user.nickname,
        }
    }
    if (parentId)
        comment.parentId = parentId;

    return dbClient.db().collection("comments").insertOne(comment);
}
