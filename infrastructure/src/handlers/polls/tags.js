const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

module.exports = (app) => {
  app.options('/bff/items/:tag', auth.cors);

  app.get('/bff/items/:tag', auth.optional, async (req, res) => {
    logger.verbose('getPoll by tag handler starts');
    const { tag } = req.params;

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const pipeline = mongo.stageTag(tag);
      
      const item = await mongo.getPollByTag(dbClient, pipeline);
      logger.debug('Item fetched');

      if (!item) {
        return api.sendNotFound(res, api.createError());
      }

      return api.sendCreated(res, api.createResponse(item));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get polls', 'sign-in.something-went-wrong'));
    }
  });
};
