const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '../..', '.env');
dotenv.config({ path: envPath });

const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

const PAGE_SIZE_COMMENTS = parseInt(process.env.PAGE_SIZE_COMMENTS || '10', 10);
const MAXIMUM_PAGE_SIZE = parseInt(process.env.MAXIMUM_PAGE_SIZE || '50', 10);

module.exports = (app) => {
  app.options('/bff/items/:itemId/comments', auth.cors);
  app.options('/bff/items/:itemId/comments/:commentId/replies', auth.cors);

  app.get('/bff/items/:itemId/comments', auth.cors, async (req, res) => {
    logger.verbose('getComments handler starts');
    const { itemId } = req.params;
    if (!itemId) {
      return api.sendBadRequest(res, api.createError('Missing parameter itemId', 'generic.internal-error'));
    }
    const listParams = api.parseListParams(req, 'id', -1, PAGE_SIZE_COMMENTS, MAXIMUM_PAGE_SIZE);

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const query = { itemId, parentId: { $exists: false } };
      if (listParams.lastResult) {
        query._id = listParams.lastResult.value;
      }

      const comments = await dbClient.db().collection('comments')
        .find(query, { projection: { itemId: 0 } })
        .sort({ _id: -1 })
        .limit(listParams.pageSize + 1)
        .toArray();
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

      const childComments = await dbClient.db().collection('comments').aggregate([
        { $match: { parentId: { $in: parentIdList } } },
        { $project: { itemId: 0 } },
        { $sort: { _id: 1 } },
        {
          $group: {
            _id: '$parentId',
            replies: { $push: '$$ROOT' },
          },
        },
      ], { allowDiskUse: true }).toArray();
      logger.debug('Replies fetched');

      comments.forEach((root) => {
        childComments.forEach((child) => {
          if (root._id === child._id) {
            root.replies = child.replies;
          }
        });
      });

      return api.sendCreated(res, api.createResponse({ limit: listParams.pageSize, incomplete, comments }));
    } catch (err) {
      logger.error('Request failed');
      logger.error(err);
      return api.sendInternalError(res, api.createError('Failed to get comments', 'sign-in.something-went-wrong'));
    }
  });

  app.get('/bff/items/:itemId/comments/:commentId/replies', auth.cors, async (req, res) => {
    logger.verbose('getReplies handler starts');
    const { commentId } = req.params;
    if (!commentId) {
      return api.sendBadRequest(res, api.createError('Missing parameter commentId', 'generic.internal-error'));
    }
    const listParams = api.parseListParams(req, 'id', 1, PAGE_SIZE_COMMENTS, MAXIMUM_PAGE_SIZE);

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const query = { parentId: commentId };
      if (listParams.lastResult) {
        query._id = listParams.lastResult.value;
      }

      const replies = await dbClient.db().collection('comments')
        .find(query, { projection: { itemId: 0 } })
        .sort({ _id: 1 })
        .toArray();
      logger.debug('Replies fetched');

      return api.sendCreated(res, api.createResponse({ replies }));
    } catch (err) {
      logger.error('Request failed');
      logger.error(err);
      return api.sendInternalError(res, api.createError('Failed to get comments', 'sign-in.something-went-wrong'));
    }
  });
};
