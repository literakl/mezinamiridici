const api = require('../../utils/api.js');
const logger = require('../../utils/logging');
const auth = require('../../utils/authenticate');
const mongo = require('../../utils/mongo.js');

require('../../utils/path_env');

module.exports = (app) => {
  app.options('/v1/misc/tags', auth.cors);
  app.options('/v1/misc/tags/cloud', auth.cors);

  app.get('/v1/misc/tags', auth.cors, async (req, res) => {
    logger.debug('get tags');
    const tagsArray = String(process.env.TAGS).split(',');
    return api.sendResponse(res, api.createResponse(tagsArray));
  });

  app.get('/v1/misc/tags/cloud', auth.cors, async (req, res) => {
    logger.debug('get tag cloud');

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const tagWeights = await dbClient.db().collection('items').aggregate([
        { $unwind: '$info.tags' },
        { $group: { _id: '$info.tags', count: { $sum: 1 } } },
      ]).toArray();
      logger.debug('Tag weights fetched');

      const tagsArray = [];
      tagWeights.forEach((item) => {
        tagsArray.push([item._id, item.count]);
      });
      tagsArray.sort();

      return api.sendResponse(res, api.createResponse(tagsArray));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create post', 'sign-in.something-went-wrong'));
    }
  });
};
