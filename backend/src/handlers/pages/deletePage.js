const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/pages/:pageId', auth.cors);

  app.delete('/v1/pages/:pageId', auth.required, auth.cms_admin, auth.cors, async (req, res) => {
    logger.verbose('Delete page handler starts');
    const { pageId } = req.params;

    if (!pageId) {
      return api.sendMissingParam(res, 'pageId');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const commandResult = await dbClient.db().collection('items').deleteOne({ _id: pageId });
      if (commandResult.result.ok === 1 && commandResult.result.n === 1) {
        logger.debug('Page deleted');
        return api.sendResponse(res, api.createResponse());
      } else {
        logger.error(`Failed to delete page ${pageId}`);
        return api.sendInternalError(res, api.createError('Failed to delete page', 'sign-in.something-went-wrong'));
      }
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to delete page', 'sign-in.something-went-wrong'));
    }
  });
};
