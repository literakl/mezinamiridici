const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

require('../../utils/path_env');

module.exports = (app) => {
  app.options('/v1/item-stream', auth.cors);

  app.get('/v1/item-stream', auth.optional, auth.cors, async (req, res) => {
    logger.debug('Get items');
    const { start, num, tag } = req.query;

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const blog = await getItems(dbClient, Number(start), Number(num), tag);
      logger.debug('Items fetched');

      return api.sendCreated(res, api.createResponse(blog));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get items', 'sign-in.something-went-wrong'));
    }
  });
};

function getItems(dbClient, start, num, tag) {
  const query = (tag === 'undefined') ? {} : { 'info.tags': tag };

  return dbClient.db().collection('items')
    .find(query)
    .sort({ 'info.date': -1 })
    .skip(start)
    .limit(num)
    .toArray();
}
