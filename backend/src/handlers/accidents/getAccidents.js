const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

require('../../utils/path_env');

module.exports = (app) => {
  app.options('/v1/accidents/last', auth.cors);

  app.get('/v1/accidents/last', auth.cors, async (req, res) => {
    logger.debug('Get last day accidents summary');

    try {
      const dbClient = await mongo.connectToDatabase();
      const result = await dbClient.db().collection('accidents')
        .find({}, { projection: { date: 1, total: 1}})
        .sort({date: -1})
        .limit(1)
        .toArray();

      if (result.length > 0) {
        return api.sendResponse(res, api.createResponse(result[0]));
      } else {
        return api.sendResponse(res, api.createResponse({}));
      }
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get last day accidents summary', 'sign-in.something-went-wrong'));
    }
  });
}
