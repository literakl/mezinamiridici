const html2text = require('html2plaintext');

const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

const { MAXIMUM_PAGE_SIZE } = process.env || 50;
const { TRUNCATE_COMMENTS } = process.env || 100;

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
        itemId: 1,
        'item.type': 1,
        'item.info.author.id': 1,
        'item.info.slug': 1,
      },
    });
  } else {
    table = 'items';
    pipeline.push({
      $match: { 'info.author.id': userId, 'info.published': true, type },
    });
    pipeline.push({
      $project: {
        'info.author.id': 1,
        'info.date': 1,
        'info.slug': 1,
        'info.caption': 1,
      },
    });
  }

  const list = await dbClient.db().collection(table)
    .aggregate(pipeline)
    .sort({ date: -1 })
    .skip(listParams.start)
    .limit(listParams.pageSize)
    .toArray();

  const result = [];
  if (type === 'comment') {
    list.forEach((x) => {
      const item = { _id: x._id, date: x.date, type: x.item[0].type, userId: x.item[0].info.author.id, slug: x.item[0].info.slug };
      item.text = html2text(x.text).substring(0, TRUNCATE_COMMENTS);
      result.push(item);
    });
  } else {
    list.forEach((x) => {
      const item = { _id: x._id, date: x.info.date, type: 'blog', userId: x.info.author.id, slug: x.info.slug };
      item.text = html2text(x.info.caption).substring(0, TRUNCATE_COMMENTS);
      result.push(item);
    });
  }

  return result;
}
