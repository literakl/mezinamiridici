const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/users/:userId/activity', auth.cors);

  app.get('/v1/users/:userId/activity', async (req, res) => {
    logger.verbose('get user activity handler starts');
    const { userId } = req.params;
    if (!userId) {
      return api.sendBadRequest(res, api.createError('Missing user id', 'generic.internal-error'));
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const list = await getActivity(dbClient, userId);
      return api.sendResponse(res, api.createResponse(list));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to load  the user activity', 'generic.something-went-wrong'));
    }
  });
};

async function getActivity(dbClient, userId) {
  const pipeline = [
    {
      $match:
        {
          userId,
        },
    },
    {
      $lookup:
        {
          from: 'items',
          localField: 'itemId',
          foreignField: '_id',
          as: 'item_doc',
        },
    },
    {
      $unwind: '$item_doc',
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            '$item_doc',
            '$$ROOT',
          ],
        },
      },
    },
    {
      $project: {
        userId: 1,
        date: 1,
        itemId: 1,
        commentId: 1,
        action: 1,
        published: 1,
        vote: 1,
        'info.slug': 1,
        'info.caption': 1,
        comments: 1,
      },
    },
  ];

  return dbClient.db().collection('user_activity').aggregate(pipeline).toArray();
}
