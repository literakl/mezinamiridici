const dayjs = require('dayjs');
const sanitizeHtml = require('sanitize-html');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/content/:cmsId', auth.cors);

  app.patch('/v1/content/:cmsId', auth.required, auth.cms_admin, auth.cors, async (req, res) => {
    logger.verbose('Update content handler starts');
    const { cmsId } = req.params;
    if (!cmsId) {
      return api.sendMissingParam(res, 'cmsId');
    }
    const {
      type, caption, slug, content, author, date, picture, published, tags,
    } = req.body;
    const publishDate = api.parseDate(date, 'YYYY-MM-DD');
    if (!publishDate) {
      return api.sendInvalidParam(res, 'date', date);
    }
    if (!type) {
      return api.sendMissingParam(res, 'type');
    }
    if (!caption) {
      return api.sendMissingParam(res, 'caption');
    }
    if (!content) {
      return api.sendMissingParam(res, 'content');
    }
    if (!picture) {
      return api.sendMissingParam(res, 'picture');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      let user = auth.getIdentity(req.identity);
      if (author && author.length > 0) {
        user = await mongo.getIdentity(dbClient, author);
        if (user === null) {
          return api.sendBadRequest(res, api.createError(`Author ${author} not found`, 'generic.internal-error'));
        }
      }

      const query = prepareUpdateQuery(type, caption, slug, content, user, picture, publishDate, published, tags);
      await dbClient.db().collection('items').updateOne({ _id: cmsId }, query);
      logger.debug('Content updated');

      const pipeline = [mongo.stageId(cmsId)];
      const item = await mongo.getCMS(dbClient, pipeline);
      logger.debug('Updated CMS fetched');
      return api.sendResponse(res, api.createResponse(item));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create CMS', 'sign-in.something-went-wrong'));
    }
  });
};

function prepareUpdateQuery(type, caption, slug, content, author, picture, date, published, tags) {
  const setters = {}, unsetters = {};
  setters.type = type;
  setters['info.caption'] = caption;
  setters['info.slug'] = slug;
  setters['data.content'] = sanitizeHtml(content, api.sanitizeConfigure());
  setters['info.author'] = { nickname: author.nickname, id: author.userId };
  setters['info.date'] = date;
  setters['info.published'] = published;
  setters['info.picture'] = picture;
  if (tags) {
    setters['info.tags'] = tags;
  }
  const query = { };
  query.$set = setters;
  if (Object.keys(unsetters).length !== 0) {
    query.$unset = unsetters;
  }
  return query;
}
