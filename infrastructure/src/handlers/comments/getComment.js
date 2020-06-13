const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

const defaultElementLimit = 5;
const defaultPageNumber = 1;
module.exports = (app) => {
  app.options('/v1/items/:itemId/comments', auth.cors);

  app.get('/v1/items/:itemId/comments', auth.required, auth.cors, async (req, res) => {
    logger.verbose('createComment handler starts');
    const { itemId } = req.params;
    const rootElementPageNumber = parseInt(req.query.page || defaultPageNumber, 10) || defaultPageNumber;
    const rootElementLimit = parseInt(req.query.limit || defaultElementLimit, 10) || defaultElementLimit;
    if (!itemId) {
      return api.sendBadRequest(res, api.createError('Missing parameter', 'generic.internal-error'));
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const rootCommentsCount = await dbClient.db().collection('comments').count({ itemId, parentId: { $exists: false } });
      const rootComments = await dbClient.db().collection('comments')
        .find({ itemId, parentId: { $exists: false } })
        .limit(rootElementLimit)
        .skip((rootElementPageNumber - 1) * rootElementLimit)
        .toArray();
      const parentIdList = [];
      rootComments.forEach((comment) => {
        parentIdList.push(comment._id);
      });

      const childComments = await dbClient.db().collection('comments').aggregate([
        {
          $match: {
            $and: [
              { parentId: { $exists: true } },
              { parentId: { $in: parentIdList } }
            ],
          },
        },
        {
          $sort: {
            date: 1,
          },
        },
        {
          $group: {
            _id: '$parentId',
            comments: { $push: '$$ROOT' },
            childCommentCount: { $sum: 1 },
          },
        },
        // {
        //     $limit:5//limits the root comments
        // }

      ], { allowDiskUse: true }).toArray();

      /*
            this this generic query
            let childComments = await dbClient.db().collection("comments").find({ itemId: itemId, parentId: { $in: parentIdList } }).limit(10).toArray();
            */
      rootComments.forEach((root) => {
        childComments.forEach((child) => {
          if (root._id === child._id) {
            root.comments = child.comments;
            // use below line if you want to limit the child explicitly
            // root.comments = child.comments.slice(0, 5);
            root.childCommentCount = child.childCommentCount;
          }
        });
      });

      if (!rootComments) {
        return api.sendNotFound(res, api.createError('Comments not found', 'generic.internal-error'));
      }
      logger.debug('Comments fetched');

      return api.sendCreated(res, api.createResponse({
        rootComments,
        rootCommentsCount,
        page: rootElementPageNumber,
        limit: rootElementLimit,
      }));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create comment', 'sign-in.something-went-wrong'));
    }
  });
};
