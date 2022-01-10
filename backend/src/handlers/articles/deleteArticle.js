const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/articles/:itemId', auth.cors);

  app.delete('/v1/articles/:itemId', auth.required, auth.cors, async (req, res) => {
    logger.debug('Delete article handler starts');
    const { itemId } = req.params;
    if (!itemId) {
      return api.sendMissingParam(res, 'itemId');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      const item = await mongo.getContent(dbClient, undefined, itemId);
      if (!item) {
        return api.sendNotFound(res, api.createError('Article not found'));
      }

      const permission = canDelete(req, item);
      if (!permission.allowed) {
        return api.sendErrorForbidden(res, api.createError('You are not authorized to perform this action'));
      }

      const promises = [
        dbClient.db().collection('items').deleteOne({ _id: itemId }),
        dbClient.db().collection('comments').deleteOne({ itemId: itemId }),
        dbClient.db().collection('comment_votes').deleteOne({ itemId: itemId }),
        dbClient.db().collection('uploads').deleteOne({ itemId: itemId }),
      ];
      if (permission.admin) {
        promises.push(mongo.logAdminActions(dbClient, req.identity.userId, 'delete article', itemId));
      }

      const [result] = await Promise.all(promises);
      if (result.deletedCount !== 1) {
        logger.error(`Failed to delete article ${itemId}`);
        return api.sendInternalError(res, api.createError('Failed to delete article', 'sign-in.something-went-wrong'));
      } else {
        logger.info(`Article deleted: ${itemId} by ${req.identity.userId}`);
        return api.sendResponse(res, api.createResponse());
      }
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to delete article', 'sign-in.something-went-wrong'));
    }
  });
};

function canDelete(req, item) {
  const isAuthor = item.info.author.id === req.identity.userId;
  if (auth.checkRole(req, auth.ROLE_EDITOR_IN_CHIEF)) {
    return { allowed: true, admin: !isAuthor };
  }

  if (isAuthor) {
    if (item.info.state === 'draft') {
      return {
        allowed: true,
        admin: false
      };
    } else {
      return { allowed: false };
    }
  }
  return { allowed: false };
}
