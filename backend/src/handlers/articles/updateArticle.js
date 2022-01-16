const sanitizeHtml = require('sanitize-html');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/articles/:itemId', auth.cors);

  app.patch('/v1/articles/:itemId', auth.required, auth.editorial_staff, auth.cors, async (req, res) => {
    logger.debug('update article handler starts');

    try {
      const { itemId } = req.params;
      if (!itemId) {
        return api.sendMissingParam(res, 'itemId');
      }
      const { title, source, picture, tags, contentPictures } = req.body;
      let { date } = req.body;

      if (!source) {
        return api.sendMissingParam(res, 'source');
      }
      if (!picture) {
        return api.sendMissingParam(res, 'picture');
      }
      if (date) {
        date = api.parseDate(date, 'YYYY-MM-DD HH:mm:ss');
      }

      const dbClient = await mongo.connectToDatabase();
      let blog = await mongo.getContent(dbClient, undefined, itemId);
      if (!blog) {
        return api.sendNotFound(res, api.createError('Article not found'));
      }

      const allowed = await canEdit(dbClient, req, blog);
      if (!allowed) {
        return api.sendErrorForbidden(res, api.createError('You are not authorized'));
      }

      const query = prepareUpdateQuery(title, source, date, picture, tags);
      await dbClient.db().collection('items').updateOne({ _id: itemId }, query);
      logger.debug('Article updated');

      blog = await mongo.getContent(dbClient, undefined, itemId);
      logger.debug('Updated article fetched');

      mongo.storePictureId(dbClient, itemId, contentPictures);

      return api.sendResponse(res, api.createResponse(blog));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(
        res,
        api.createError('Failed to update article', 'sign-in.something-went-wrong'),
      );
    }
  });

  app.options('/v1/articles/:itemId/published', auth.cors);

  app.patch('/v1/articles/:itemId/published', auth.required, auth.editor_in_chief, auth.cors, async (req, res) => {
    logger.debug('published handler starts');
    const { itemId } = req.params;
    if (!itemId) {
      return api.sendMissingParam(res, 'itemId');
    }
    const { flag } = req.body;
    if (typeof flag !== 'boolean') {
      return api.sendMissingParam(res, 'flag');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      const query = { $set: { 'info.state': flag ? 'published' : 'draft' } };
      const result = await dbClient.db().collection('items').updateOne({ _id: itemId }, query);
      if (result.matchedCount === 1) {
        logger.debug(`Updated a published flag to ${flag} for article ${itemId}`);
        await mongo.logAdminActions(dbClient, req.identity.userId, 'toggle published', itemId, { flag });
        return api.sendResponse(res, api.createResponse());
      } else {
        return api.sendNotFound(res, api.createError('Not found'));
      }
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to set a published flag', 'sign-in.something-went-wrong'));
    }
  });
};

function prepareUpdateQuery(title, source, date, picture, tags) {
  const content = sanitizeHtml(source, api.sanitizeConfigure());
  const setters = {};
  setters['data.content'] = content;
  setters['info.caption'] = title;
  setters['info.picture'] = picture;
  setters['info.tags'] = tags;
  if (date) {
    setters['info.date'] = date;
  }

  const query = {};
  query.$set = setters;

  return query;
}

async function canEdit(dbClient, req, item) {
  if (auth.checkRole(req, auth.ROLE_EDITOR_IN_CHIEF)) {
    await mongo.logAdminActions(dbClient, req.identity.userId, 'edit article', item._id);
    return true;
  }
  return (item.info.author.id === req.identity.userId) && (item.info.state === 'draft');
}
