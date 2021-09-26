const sanitizeHtml = require('sanitize-html');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/posts/:blogId', auth.cors);

  app.patch('/v1/posts/:blogId', auth.required, auth.cors, async (req, res) => {
    logger.debug('update blog handler starts');

    const { blogId } = req.params;
    if (!blogId) {
      return api.sendMissingParam(res, 'blogId');
    }
    const { source, title, picture, tags, contentPictures } = req.body;

    if (!source) {
      return api.sendMissingParam(res, 'source');
    }
    if (!picture) {
      return api.sendMissingParam(res, 'picture');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      let blog = await mongo.getBlog(dbClient, undefined, blogId);
      if (blog && blog.info.author.id !== req.identity.userId) {
        return api.sendErrorForbidden(
          res,
          api.createError('You are not authorized to perform this action'),
        );
      }

      const query = prepareUpdateQuery(source, title, picture, tags);
      await dbClient.db().collection('items').updateOne({ _id: blogId }, query);
      logger.debug('Blog updated');

      blog = await mongo.getBlog(dbClient, undefined, blogId);
      logger.debug('Updated blog fetched');

      mongo.storePictureId(dbClient, blogId, contentPictures);

      return api.sendResponse(res, api.createResponse(blog));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(
        res,
        api.createError('Failed to update blog', 'sign-in.something-went-wrong'),
      );
    }
  });

  app.options('/v1/posts/:blogId/editorial', auth.cors);

  app.patch('/v1/posts/:blogId/editorial', auth.required, auth.cms_admin, auth.cors, async (req, res) => {
    logger.debug('mark blog as editorial handler starts');
    const { blogId } = req.params;
    if (!blogId) {
      return api.sendMissingParam(res, 'blogId');
    }
    const { flag } = req.body;
    if (typeof flag !== 'boolean') {
      return api.sendMissingParam(res, 'flag');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      const query = { $set: { 'info.editorial': flag } };
      await Promise.all([
        dbClient.db().collection('items').updateOne({ _id: blogId }, query),
        mongo.logAdminActions(dbClient, req.identity.userId, 'toggle editorial', blogId, { flag }),
      ]);
      logger.debug(`Updated an editorial flag to ${flag} for blog ${blogId}`);

      return api.sendResponse(res, api.createResponse());
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to set an editorial flag', 'sign-in.something-went-wrong'));
    }
  });

  app.options('/v1/posts/:blogId/hidden', auth.cors);

  app.patch('/v1/posts/:blogId/hidden', auth.required, auth.blog_admin, auth.cors, async (req, res) => {
    logger.debug('mark blog as hidden handler starts');
    const { blogId } = req.params;
    if (!blogId) {
      return api.sendMissingParam(res, 'blogId');
    }
    const { flag } = req.body;
    if (typeof flag !== 'boolean') {
      return api.sendMissingParam(res, 'flag');
    }
    try {
      const dbClient = await mongo.connectToDatabase();
      const query = { $set: { 'info.hidden': flag } };
      await Promise.all([
        await dbClient.db().collection('items').updateOne({ _id: blogId }, query),
        mongo.logAdminActions(dbClient, req.identity.userId, 'update hidden flag', blogId, { flag }),
      ]);
      logger.debug(`Updated a hidden flag to ${flag} for blog ${blogId}`);
      return api.sendResponse(res, api.createResponse());
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to set a hidden flag', 'sign-in.something-went-wrong'));
    }
  });
};


function prepareUpdateQuery(source, title, picture, tags) {
  const content = sanitizeHtml(source, api.sanitizeConfigure());
  const setters = {};
  setters['data.content'] = content;
  setters['info.caption'] = title;
  setters['info.picture'] = picture;
  setters['info.tags'] = tags;

  const query = {};
  query.$set = setters;

  return query;
}
