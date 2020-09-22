require('../../utils/path_env');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

const { MAXIMUM_PAGE_SIZE } = process.env || 50;

module.exports = (app) => {
  app.options('/bff/polls/', auth.cors);

  app.get('/bff/polls/', auth.optional, async (req, res) => {
    logger.verbose('getPolls handler starts');
    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const list = await getItems(dbClient, req);
      logger.debug('Items fetched');

      return api.sendResponse(res, api.createResponse(list));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get poll', 'generic.internal-error'));
    }
  });
};

async function getItems(dbClient, req) {
  const listParams = api.parseListParams(req, 'date', -1, 20, MAXIMUM_PAGE_SIZE);
  const query = { type: 'poll', 'info.published': true };
  if (auth.checkRole(req, auth.ROLE_POLL_ADMIN)) {
    delete query['info.published'];
  }
  if (listParams.lastResult) {
    query[listParams.lastResult.key] = listParams.lastResult.value;
  }
  const pipeline = [
    { $match: query },
    { $sort: listParams.order },
    { $limit: listParams.pageSize },
  ];
  const polls = await dbClient.db().collection('items').aggregate(pipeline, { allowDiskUse: true }).toArray();
  polls.forEach(item => mongo.processPoll(item));
  return polls;
}
