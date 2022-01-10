const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

const { MAXIMUM_PAGE_SIZE } = process.env || 50;

module.exports = (app) => {
  app.options('/bff/items/:tag', auth.cors);

  app.get('/bff/items/:tag', async (req, res) => {
    logger.debug('getItems by tag handler starts');
    try {
      const dbClient = await mongo.connectToDatabase();
      const list = await getItems(dbClient, req);
      logger.debug('Item fetched');

      if (!list.length) {
        return api.sendResponse(res, api.createResponse([]));
      } else {
        return api.sendResponse(res, api.createResponse(list));
      }
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get items', 'sign-in.something-went-wrong'));
    }
  });
};

async function getItems(dbClient, req) {
  const { tag } = req.params;
  const query = { 'info.state': 'published', 'info.tags': tag };
  const listParams = api.parseListParams(req, 'date', -1, 20, MAXIMUM_PAGE_SIZE);
  if (listParams.lastResult) {
    query[listParams.lastResult.key] = listParams.lastResult.value;
  }
  const pipeline = [
    { $match: query },
    { $sort: listParams.order },
    { $limit: listParams.pageSize },
    { $project: { 'data.content': 0 } },
  ];
  const items = await dbClient.db().collection('items').aggregate(pipeline, { allowDiskUse: true }).toArray();
  // todo make it generic for any kind of item
  items.forEach((item) => {
    if (item.type === 'poll' || item.type === 'blog') {
      return mongo.processPoll(item);
    } else {
      return item;
    }
  });
  return items;
}
