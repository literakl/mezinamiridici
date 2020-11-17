require('../../utils/path_env');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

const PAGE_SIZE_COMMENTS = parseInt(process.env.PAGE_SIZE_COMMENTS || '10', 10);
const MAXIMUM_PAGE_SIZE = parseInt(process.env.MAXIMUM_PAGE_SIZE || '50', 10);

module.exports = (app) => {
  app.options('/bff/items/:itemId/comments', auth.cors);
  app.options('/bff/items/:itemId/comments/:commentId', auth.cors);

  app.get('/bff/items/:itemId/comments', auth.cors, auth.optional, async (req, res) => {
    logger.verbose('getComments handler starts');
    const { itemId } = req.params;
    if (!itemId) {
      return api.sendMissingParam(res, 'itemId');
    }
    const listParams = api.parseListParams(req, 'id', -1, PAGE_SIZE_COMMENTS, MAXIMUM_PAGE_SIZE);

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const query = { itemId, parentId: { $exists: false } };
      if (listParams.lastResult) {
        query._id = listParams.lastResult.value;
      }

      let pipeline = [
        { $match: query },
        { $sort: { _id: -1 } },
        { $limit: listParams.pageSize + 1 },
        mongo.stageCommentVotes(),
        mongo.stageReduceCommentData(),
      ];
      const comments = await dbClient.db().collection('comments').aggregate(pipeline, { allowDiskUse: true }).toArray();
      logger.debug('Comments fetched');

      const parentIdList = [];
      comments.forEach((comment) => {
        parentIdList.push(comment._id);
      });

      const incomplete = parentIdList.length > listParams.pageSize;
      if (incomplete) {
        comments.pop();
        parentIdList.pop();
      }

      if (parentIdList.length === 0) {
        return api.sendCreated(res, api.createResponse({ limit: listParams.pageSize, incomplete, comments: [] }));
      }

      pipeline = [
        { $match: { parentId: { $in: parentIdList } } },
        mongo.stageCommentVotes(),
        mongo.stageReduceCommentData(),
        { $sort: { _id: 1 } },
        {
          $group: {
            _id: '$parentId',
            replies: { $push: '$$ROOT' },
          },
        },
      ];
      const childComments = await dbClient.db().collection('comments').aggregate(pipeline, { allowDiskUse: true }).toArray();
      logger.debug('Replies fetched');

      comments.forEach((root) => {
        childComments.forEach((child) => {
          if (root._id === child._id) {
            root.replies = child.replies;
          }
        });
      });

      return api.sendResponse(res, api.createResponse({ limit: listParams.pageSize, incomplete, comments }));
    } catch (err) {
      logger.error('Request failed');
      logger.error(err);
      return api.sendInternalError(res, api.createError('Failed to get comments', 'sign-in.something-went-wrong'));
    }
  });

  app.get('/bff/items/:itemId/comments/:commentId', auth.cors, auth.optional, async (req, res) => {
    logger.verbose('getComment handler starts');
    const { commentId } = req.params;
    if (!commentId) {
      return api.sendBadRequest(res, api.createError('Missing parameter commentId', 'generic.internal-error'));
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const query = {
        $or: [
          { _id: commentId }, // fetch the comment
          { parentId: commentId }, // fetch its replies
        ],
      };

      const pipeline = [
        { $match: query },
        { $sort: { _id: 1 } },
        mongo.stageCommentVotes(),
        mongo.stageReduceCommentData(),
      ];
      const replies = await dbClient.db().collection('comments').aggregate(pipeline, { allowDiskUse: true }).toArray();
      logger.debug('Replies fetched');

      const index = replies.findIndex(obj => obj._id === commentId);
      const comment = replies[index];
      const filteredReplies = [
        ...replies.slice(0, index),
        ...replies.slice(index + 1),
      ];
      comment.replies = filteredReplies;
      return api.sendResponse(res, api.createResponse({ comment }));
    } catch (err) {
      logger.error('Request failed');
      logger.error(err);
      return api.sendInternalError(res, api.createError('Failed to get comments', 'sign-in.something-went-wrong'));
    }
  });
};
