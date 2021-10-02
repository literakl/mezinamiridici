const sanitizeHtml = require('sanitize-html');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/posts/:blogId', auth.cors);

  app.patch('/v1/posts/:blogId', auth.required, auth.cors, async (req, res) => {
    logger.debug('update blog handler starts');

    try {
      const { blogId } = req.params;
      if (!blogId) {
        return api.sendMissingParam(res, 'blogId');
      }
      const { source, title, picture, tags, contentPictures } = req.body;
      let { editorial = false } = req.body;

      if (!source) {
        return api.sendMissingParam(res, 'source');
      }
      if (!picture) {
        return api.sendMissingParam(res, 'picture');
      }
      if (typeof editorial === 'boolean' && editorial) {
        if (!auth.checkRole(req, auth.ROLE_STAFFER, auth.ROLE_EDITOR_IN_CHIEF)) {
          return api.sendInvalidParam(res, 'editorial');
        }
      } else {
        editorial = false;
      }

      const dbClient = await mongo.connectToDatabase();
      let blog = await mongo.getBlog(dbClient, undefined, blogId);
      if (!blog) {
        return api.sendNotFound(res, api.createError('Blog not found'));
      }

      const allowed = await canEdit(dbClient, req, blog);
      if (!allowed) {
        return api.sendErrorForbidden(res, api.createError('You are not authorized'));
      }

      const query = prepareUpdateQuery(source, title, picture, tags, editorial);
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

  app.patch('/v1/posts/:blogId/editorial', auth.required, auth.editor_in_chief, auth.cors, async (req, res) => {
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

function prepareUpdateQuery(source, title, picture, tags, editorial) {
  const content = sanitizeHtml(source, api.sanitizeConfigure());
  const setters = {};
  setters['data.content'] = content;
  setters['info.caption'] = title;
  setters['info.editorial'] = editorial;
  setters['info.picture'] = picture;
  setters['info.tags'] = tags;

  const query = {};
  query.$set = setters;

  return query;
}

async function canEdit(dbClient, req, blog) {
  const isAuthor = blog.info.author.id === req.identity.userId;
  const isEditorial = blog.info.editorial;

  // users can always edit their blog posts, unless it is a published editorial articles
  if (isAuthor && !isEditorial && !blog.info.published) {
    return true;
  }

  // blog admin can edit any blog posts, except editorial articles
  if (!isEditorial && auth.checkRole(req, auth.ROLE_BLOG_ADMIN)) {
    await mongo.logAdminActions(dbClient, req.identity.userId, 'edit blog', blog._id);
    return true;
  }

  // editor in chied can edit any editorial articles
  if (isEditorial && auth.checkRole(req, auth.ROLE_EDITOR_IN_CHIEF)) {
    await mongo.logAdminActions(dbClient, req.identity.userId, 'edit blog', blog._id);
    return true;
  }

  return false;
}
