const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

module.exports = (app) => {
  app.options('/bff/c/:slug', auth.cors);
  app.options('/bff/h/:slug', auth.cors);

  app.get('/bff/c/:slug', auth.optional, async (req, res) => {
    logger.verbose('get CMS by slug handler starts');
    const { slug } = req.params;

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const pipeline = [mongo.stageCMSSlug(slug, 'content')];
      const item = await mongo.getCMS(dbClient, pipeline);
      logger.debug('Item fetched');

      if (!item) {
        return api.sendNotFound(res, api.createError());
      }
      return api.sendCreated(res, api.createResponse(item));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get CMS', 'sign-in.something-went-wrong'));
    }
  });

  app.get('/bff/h/:slug', auth.optional, async (req, res) => {
    logger.verbose('get CMS by slug handler starts');
    const { slug } = req.params;

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const pipeline = [mongo.stageCMSSlug(slug, 'help')];
      const item = await mongo.getCMS(dbClient, pipeline);
      logger.debug('Item fetched');

      if (!item) {
        return api.sendNotFound(res, api.createError());
      }
      return api.sendCreated(res, api.createResponse(item));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get CMS', 'sign-in.something-went-wrong'));
    }
  });

};
