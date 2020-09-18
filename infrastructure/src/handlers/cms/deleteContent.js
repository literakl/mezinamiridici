const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/content/:cmsId', auth.cors);

  app.delete('/v1/content/:cmsId', auth.required, auth.cms_admin, auth.cors, async (req, res) => {
    logger.verbose('Delete content handler starts');
    const { cmsId } = req.params;

    if (!cmsId) {
      return api.sendMissingParam(res, 'cmsId');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const commandResult = await dbClient.db().collection('items').deleteOne({ _id: cmsId });
      if (commandResult.result.ok === 1 && commandResult.result.n === 1) {
        logger.debug('Content deleted');
        return api.sendResponse(res, api.createResponse());
      } else {
        logger.error(`Failed to delete content ${cmsId}`);
        return api.sendInternalError(res, api.createError('Failed to delete content', 'sign-in.something-went-wrong'));
      }
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to delete content', 'sign-in.something-went-wrong'));
    }
  });
};
