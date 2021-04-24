const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/blog/:blogId', auth.cors);

  app.delete('/v1/blog/:blogId', auth.required, auth.cors, async (req, res) => {
    logger.debug('Delete blog handler starts');
    const { blogId } = req.params;

    if (!blogId) {
      return api.sendMissingParam(res, 'blogId');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      let blog = await mongo.getBlog(dbClient, undefined, blogId);
      const isBlogAdmin = req.identity.roles && req.identity.roles.includes(auth.ROLE_BLOG_ADMIN);
      const isAuthor = blog && (blog.info.author.id === req.identity.userId);

      if ( !isAuthor && !isBlogAdmin) {
        return api.sendErrorForbidden(res, api.createError('You are not authorized to perform this action'));
      }

      const promises = [ dbClient.db().collection('items').deleteOne({ _id: blogId }) ];
      if (isBlogAdmin && !isAuthor) {
        promises.push(mongo.logAdminActions(dbClient, req.identity.userId, 'delete blog', blogId));
      }
      const [commandResult] = await Promise.all(promises);
      if (commandResult.result.ok === 1 && commandResult.result.n === 1) {
        logger.debug(`Blog deleted: ${blogId}`);
        return api.sendResponse(res, api.createResponse());
      } else {
        logger.error(`Failed to delete blog: ${blogId}`);
        return api.sendInternalError(res, api.createError('Failed to delete blog', 'sign-in.something-went-wrong'));
      }
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to delete blog', 'sign-in.something-went-wrong'));
    }
  });
};
