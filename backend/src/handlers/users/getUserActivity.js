const html2text = require('html2plaintext');

const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

const { MAXIMUM_PAGE_SIZE } = process.env || 50;

module.exports = (app) => {
  app.options('/v1/users/:userId/activity', auth.cors);

  app.get('/v1/users/:userId/activity', async (req, res) => {
    logger.verbose('get user activity handler starts');
    const { userId } = req.params;
    if (!userId) {
      return api.sendBadRequest(res, api.createError('Missing user id', 'generic.internal-error'));
    }

    const { type } = req.query;
    if (!type) {
      return api.sendBadRequest(res, api.createError('Missing type', 'generic.internal-error'));
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const list = await getActivity(dbClient, userId, type, req);
      logger.debug('Activity fetched');

      list.forEach((x) => {
        if (x.text) {
          x.text = html2text(x.text);
        }
      });

      return api.sendResponse(res, api.createResponse(list));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to load  the user activity', 'generic.something-went-wrong'));
    }
  });
};

async function getActivity(dbClient, userId, type, req) {
  const listParams = api.parseStreamParams(req, 20, MAXIMUM_PAGE_SIZE);
  let table;
  const pipeline = [];

  if (type === 'comment') {
    table = 'comments';
    pipeline.push(
      {
        $match: { 'author.id': userId },
      },
      {
        $lookup:
          {
            from: 'items',
            localField: 'itemId',
            foreignField: '_id',
            as: 'item',
          },
      },
    );
    pipeline.push({
      $project: {
        date: 1,
        text: 1,
      },
    });
  } else {
    table = 'items';
    pipeline.push({
      $match: { 'info.author.id': userId, 'info.published': true, type },
    });
    pipeline.push({
      $project: {
        'info.date': 1,
        'info.slug': 1,
        'info.caption': 1,
      },
    });
  }

  return dbClient.db().collection(table)
    .aggregate(pipeline)
    .sort({ date: -1 })
    .skip(listParams.start)
    .limit(listParams.pageSize)
    .toArray();
}
