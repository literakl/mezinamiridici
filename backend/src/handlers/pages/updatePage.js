const dayjs = require('dayjs');
const sanitizeHtml = require('sanitize-html');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/pages/:pageId', auth.cors);

  app.patch('/v1/pages/:pageId', auth.required, auth.page_admin, auth.cors, async (req, res) => {
    logger.debug('Update page handler starts');
    const { pageId } = req.params;
    if (!pageId) {
      return api.sendMissingParam(res, 'pageId');
    }
    const {
      caption, slug, content, contentPictures,
    } = req.body;
    if (!caption) {
      return api.sendMissingParam(res, 'caption');
    }
    if (!content) {
      return api.sendMissingParam(res, 'content');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      const query = prepareUpdateQuery(caption, slug, content);
      await Promise.all([
        dbClient.db().collection('items').updateOne({ _id: pageId }, query),
        mongo.logAdminActions(dbClient, req.identity.userId, 'update page', pageId),
      ]);
      logger.debug('Page updated');

      const item = await mongo.getContent(dbClient, null, pageId);
      logger.debug('Updated page fetched');

      mongo.storePictureId(dbClient, pageId, contentPictures);

      return api.sendResponse(res, api.createResponse(item));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to update page', 'sign-in.something-went-wrong'));
    }
  });
};

function prepareUpdateQuery(caption, slug, content) {
  const setters = {};
  setters['info.caption'] = caption;
  setters['info.slug'] = slug;
  setters['data.content'] = sanitizeHtml(content, api.sanitizeConfigure());
  const query = { };
  query.$set = setters;
  return query;
}
