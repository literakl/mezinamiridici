const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/activity/:userId', auth.cors);

  app.get('/v1/activity/:userId', auth.required, async (req, res) => {
    logger.verbose('get user activity handler starts');
    const { userId } = req.params;
    if (!userId) {
      return api.sendBadRequest(res, api.createError('Missing user id', 'generic.internal-error'));
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const user = await mongo.findUser(dbClient, { userId });
      logger.debug('User fetched');
      if (!user) {
        return api.sendErrorForbidden(res, api.createError('User not found', 'profile.user-not-found'));
      }

      if ((!req.identity || req.identity.userId !== userId) && !user.prefs.public) {
        logger.debug('not authorized');
      }
      const list = await mongo.getActivity(dbClient, userId);

      return api.sendResponse(res, api.createResponse(list));
      
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to load  the user', 'generic.something-went-wrong'));
    }
  });

};
