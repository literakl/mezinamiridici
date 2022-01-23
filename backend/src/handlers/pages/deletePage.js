const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/pages/:pageId', auth.cors);

  app.delete('/v1/pages/:pageId', auth.required, auth.page_admin, auth.cors, async (req, res) => {
    logger.debug('Delete page handler starts');
    const { pageId } = req.params;

    if (!pageId) {
      return api.sendMissingParam(res, 'pageId');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      const [result] = await Promise.all([
        dbClient.db().collection('items').deleteOne({ _id: pageId }),
        mongo.logAdminActions(dbClient, req.identity.userId, 'delete page', pageId),
      ]);
      if (result.deletedCount !== 1) {
        logger.error(`Failed to delete page ${pageId}`);
        return api.sendInternalError(res, api.createError('Failed to delete page', 'sign-in.something-went-wrong'));
      } else {
        logger.debug('Page deleted');
        return api.sendResponse(res, api.createResponse());
      }
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to delete page', 'sign-in.something-went-wrong'));
    }
  });
};
