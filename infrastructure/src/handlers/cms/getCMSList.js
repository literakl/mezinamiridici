require('../../utils/path_env');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

const MAXIMUM_PAGE_SIZE = process.env.MAXIMUM_PAGE_SIZE || 50;

module.exports = (app) => {
  app.options('/bff/cms-list/', auth.cors);

  app.get('/bff/cms-list/', auth.optional, async (req, res) => {
    logger.verbose('get CMS list handler starts');
    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const list = await getCMSList(dbClient, req);
      logger.debug('CMS list fetched');

      return api.sendResponse(res, api.createResponse(list));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get CMS', 'generic.internal-error'));
    }
  });
};

async function getCMSList(dbClient, req) {
  const listParams = api.parseListParams(req, 'date', -1, 20, MAXIMUM_PAGE_SIZE);
  const query = { type: {$in: ["help", "content"]}, 'info.published': true };
  if (auth.checkRole(req, auth.ROLE_CMS_ADMIN)) {
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
  return polls;
}
