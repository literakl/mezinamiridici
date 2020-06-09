const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require("../../utils/logging");
let defaultElementLimit = 5;
let defaultPageNumber = 1;
module.exports = (app) => {
    app.options('/v1/polls/:pollId/comment', auth.cors);

    app.get('/v1/polls/:pollId/comment', auth.required, auth.cors, async (req, res) => {
        logger.verbose("createComment handler starts");
        const { pollId } = req.params;
        const rootElementPageNumber = parseInt(req.query.page || defaultPageNumber) || defaultPageNumber;
        const rootElementLimit = parseInt(req.query.limit || defaultElementLimit) || defaultElementLimit;
        if (!pollId) {
            return api.sendBadRequest(res, api.createError("Missing parameter", "generic.internal-error"));
        }

        try {
            const dbClient = await mongo.connectToDatabase();
            logger.debug("Mongo connected");
            let rootCommentsCount = await dbClient.db().collection("comments").count({ pollId: pollId, parentCommentId: { "$exists": false } });
            let rootComments = await dbClient.db().collection("comments")
                .find({ pollId: pollId, parentCommentId: { "$exists": false } })
                .limit(rootElementLimit)
                .skip((rootElementPageNumber - 1) * rootElementLimit)
                .toArray();
            const parentCommentIdList = [];
            rootComments.forEach(comment => {
                parentCommentIdList.push(comment._id);
            });
            var childComments = await dbClient.db().collection("comments").aggregate([
                {
                    $match: {
                        parentCommentId: { "$exists": true },
                        parentCommentId: { $in: parentCommentIdList }
                    }
                },
                {
                    $sort: {
                        created: 1
                    }
                },
                {
                    $group: {
                        _id: "$parentCommentId",
                        "comments": { "$push": "$$ROOT" },
                        "childCommentCount": { $sum: 1 }
                    }
                },
                // {
                //     $limit:5//limits the root comments
                // }

            ], { allowDiskUse: true }).toArray()
            /*
            this this generic query
            let childComments = await dbClient.db().collection("comments").find({ pollId: pollId, parentCommentId: { $in: parentCommentIdList } }).limit(10).toArray();
            */
            rootComments.forEach(root => {
                childComments.forEach(child => {
                    if (root._id === child._id) {
                        root.comments = root.comments || [];
                        root.comments = child.comments;
                        // use below line if you want to limit the child explicitly
                        // root.comments = child.comments.slice(0, 5);
                        root.childCommentCount = child.childCommentCount
                    }
                });
            });

            if (!rootComments) {
                return api.sendNotFound(res, api.createError("Comments not found", "generic.internal-error"));
            }
            logger.debug("Comments fetched");


            return api.sendCreated(res, api.createResponse({
                rootComments: rootComments,
                rootCommentsCount: rootCommentsCount,
                page: rootElementPageNumber,
                limit: rootElementLimit
            }));
        } catch (err) {
            logger.error("Request failed", err);
            return api.sendInternalError(res, api.createError('Failed to create comment', "sign-in.something-went-wrong"));
        }
    })
};
