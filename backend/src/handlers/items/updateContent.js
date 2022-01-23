const sanitizeHtml = require('sanitize-html');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/content/:itemId', auth.cors);

  app.patch('/v1/content/:itemId', auth.required, auth.cors, async (req, res) => {
    logger.debug('update content handler starts');

    try {
      const { itemId } = req.params;
      if (!itemId) {
        return api.sendMissingParam(res, 'itemId');
      }
      const { source } = req.body;
      if (!source) {
        return api.sendMissingParam(res, 'source');
      }

      const dbClient = await mongo.connectToDatabase();
      let item = await mongo.getContent(dbClient, undefined, itemId);
      if (!item) {
        return api.sendNotFound(res, api.createError('Item not found'));
      }

      let allowed = false;
      if (item.type === 'article') {
        allowed = auth.checkRole(req, auth.ROLE_EDITOR_IN_CHIEF);
      } else if (item.type === 'page') {
        allowed = auth.checkRole(req, auth.ROLE_PAGE_ADMIN);
      }
      if (!allowed) {
        return api.sendErrorForbidden(res, api.createError('You are not authorized'));
      }

      const query = { $set: { 'data.content': source } };
      await dbClient.db().collection('items').updateOne({ _id: itemId }, query);
      logger.debug('Item updated');

      item = await mongo.getContent(dbClient, undefined, itemId);
      logger.debug('Updated item fetched');

      return api.sendResponse(res, api.createResponse(item));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(
        res,
        api.createError('Failed to update item', 'sign-in.something-went-wrong'),
      );
    }
  });
}
