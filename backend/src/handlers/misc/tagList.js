const api = require('../../utils/api.js');
const { logger } = require('../../utils/logging');
const auth = require('../../utils/authenticate');
const mongo = require('../../utils/mongo.js');

require('../../utils/path_env');

const { TAGS } = process.env;
const TAGS_ARRAY = String(TAGS).split(',');

module.exports = (app) => {
  app.options('/v1/misc/tags', auth.cors);
  app.options('/v1/misc/tags/cloud', auth.cors);

  app.get('/v1/misc/tags', auth.cors, async (req, res) => {
    logger.debug('get tags');
    return api.sendResponse(res, api.createResponse(TAGS_ARRAY));
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

      const result = [];
      tagWeights.forEach((item) => {
        result.push([item._id, item.count]);
      });
      result.sort();

      return api.sendResponse(res, api.createResponse(result));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create post', 'sign-in.something-went-wrong'));
    }
  });
};
