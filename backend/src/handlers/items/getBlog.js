const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

require('../../utils/path_env');

module.exports = (app) => {
  app.options('/v1/blog', auth.cors);

  app.get('/v1/blog/:slug', auth.cors, async (req, res) => {
    logger.debug('get blog');
    const { slug } = req.params;
    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const blog = await mongo.getBlog(dbClient, slug, undefined);
      logger.debug('Blog fetched');

      return api.sendCreated(res, api.createResponse(blog));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get blog', 'sign-in.something-went-wrong'));
    }
  });
};
