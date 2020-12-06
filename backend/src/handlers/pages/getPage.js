const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

const { MAXIMUM_PAGE_SIZE } = process.env || 50;

module.exports = (app) => {
  app.options('/v1/pages/:slug', auth.cors);
  app.options('/v1/pages/', auth.cors);

  app.get('/v1/pages/:slug', async (req, res) => {
    logger.verbose('Get page by slug handler starts');
    const { slug } = req.params;

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const pipeline = [mongo.stageSlug(slug)];
      const item = await mongo.getPage(dbClient, pipeline);
      logger.debug('Item fetched');

      if (!item) {
        return api.sendNotFound(res, api.createError());
      }
      return api.sendCreated(res, api.createResponse(item));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get page', 'sign-in.something-went-wrong'));
    }
  });

  app.get('/v1/pages/', async (req, res) => {
    logger.verbose('Get pages handler starts');
    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const list = await getPages(dbClient, req);
      logger.debug('Pages fetched');

      return api.sendResponse(res, api.createResponse(list));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get pages', 'generic.internal-error'));
    }
  });
};

async function getPages(dbClient, req) {
  const listParams = api.parseListParams(req, 'date', -1, 20, MAXIMUM_PAGE_SIZE);
  const query = { type: 'page' };
  if (listParams.lastResult) {
    query[listParams.lastResult.key] = listParams.lastResult.value;
  }
  const pipeline = [
    { $match: query },
    { $sort: listParams.order },
    { $limit: listParams.pageSize },
  ];
  return dbClient.db().collection('items').aggregate(pipeline, { allowDiskUse: true }).toArray();
}
