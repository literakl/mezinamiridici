const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

require('../../utils/path_env');

module.exports = (app) => {
  app.options('/v1/blog', auth.cors);

  app.get('/v1/blog', auth.required, auth.cors, async (req, res) => {
    logger.debug('GET BLOG');
    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const pipeline = [{ $sort: { 'date': -1 } }, mongo.stageLimit(1)];
      
      const blog = await getBlog(dbClient, pipeline);
      logger.debug('Blog fetched');

      return api.sendCreated(res, api.createResponse(blog));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get blog', 'sign-in.something-went-wrong'));
    }
  });
};

async function getBlog(dbClient, pipeline) {
  const cursor = dbClient.db().collection('blogs').aggregate(pipeline);
  const blog = await cursor.next();
  
  return blog;
}
