const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const logger = require('../../utils/logging');

module.exports = (app) => {
  app.get('/v1/polls/', async (req, res) => {
    logger.verbose('getPolls handler starts');
    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const list = await getItems(dbClient, req).toArray();
      logger.debug('Items fetched');

      return api.sendResponse(res, api.createResponse(list));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get poll', 'generic.internal-error'));
    }
  });
};

function getItems(dbClient, req) {
  const listParams = api.parseListParams(req, 'date', -1, 10, 50);
  const query = { type: 'poll', 'info.published': true };
  if (listParams.lastResult) {
    query[listParams.lastResult.key] = listParams.lastResult.value;
  }
  return dbClient.db().collection('items').find(query).sort(listParams.order)
    .limit(listParams.pageSize);
}
