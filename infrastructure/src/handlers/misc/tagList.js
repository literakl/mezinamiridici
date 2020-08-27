const api = require('../../utils/api.js');
const logger = require('../../utils/logging');
const auth = require('../../utils/authenticate');
const mongo = require('../../utils/mongo.js');

require('../../utils/path_env');

module.exports = (app) => {
  app.options('/v1/misc/tags', auth.cors);

  app.get('/v1/misc/tags', auth.required, auth.cors, async (req, res) => {
    logger.debug('GET TAGS');

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      let tags = String(process.env.TAGS).split(',');
      const tagWeights = await dbClient.db().collection('items').aggregate([
        { $unwind: '$info.tags' },
        { $group: { _id: '$info.tags', count: { $sum: 1 } } },
      ]).toArray();
      logger.debug('Tag weights fetched');

      const tagsArray = [];
      tagWeights.forEach((item) => {
        tagsArray.push([item._id, item.count]);
        tags = tags.filter(x => x !== item._id);
      });

      tags.forEach((tag) => {
        tagsArray.push([tag, 0]);
      });

      tagsArray.sort();

      return api.sendResponse(res, api.createResponse(tagsArray));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create post', 'sign-in.something-went-wrong'));
    }
  });
};
