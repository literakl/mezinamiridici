const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

require('../../utils/path_env');

const { MAXIMUM_PAGE_SIZE } = process.env || 50;

module.exports = (app) => {
  app.options('/v1/item-stream', auth.cors);

  app.get('/v1/item-stream', auth.cors, async (req, res) => {
    logger.debug(`Get items ${JSON.stringify(req.query)}`);

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const items = await getItems(dbClient, req);
      logger.debug('Items fetched');

      return api.sendResponse(res, api.createResponse(items));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get items', 'sign-in.something-went-wrong'));
    }
  });
};

function getItems(dbClient, req) {
  const listParams = api.parseStreamParams(req, 20, MAXIMUM_PAGE_SIZE);
  const { tag } = req.query;
  const query = { 'info.published': true, type: { $ne: 'page' } };
  if (tag) {
    query['info.tags'] = tag;
  }

  return dbClient.db().collection('items')
    .find(query)
    .project({ type: 1, info: 1, comments: 1 })
    .sort({ 'info.date': -1 })
    .skip(listParams.start)
    .limit(listParams.pageSize)
    .toArray();
}
