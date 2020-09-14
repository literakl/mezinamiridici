const slugify = require('slugify');
const dayjs = require('dayjs');
const sanitizeHtml = require('sanitize-html');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/cms', auth.cors);

  app.post('/v1/cms', auth.required, auth.poll_admin, auth.cors, async (req, res) => {
    logger.verbose('Create CMS handler starts');
    const {
      type, caption, slug, content, author, date, picture, tags,
    } = req.body;
    if (!caption || !slug || !content) {
      return api.sendMissingParam(res, 'content');
    }
    const publishDate = api.parseDate(date, 'YYYY-MM-DD');
    if (!publishDate) {
      return api.sendInvalidParam(res, 'date', date);
    }
    if (!picture) {
      return api.sendMissingParam(res, 'picture');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      let user = auth.getIdentity(req.identity);
      if (author !== undefined && author.length > 0) {
        user = await mongo.getIdentity(dbClient, author);
        if (user === null) {
          return api.sendBadRequest(res, api.createError(`Author ${author} not found`, 'generic.internal-error'));
        }
      }

      const cmsId = mongo.generateTimeId();
      await insertCMS(dbClient, cmsId, type, caption, slug, content, user, picture, publishDate, tags);
      logger.debug('CMS inserted');

      const pipeline = [mongo.stageId(cmsId)];
      const cms = await mongo.getCMS(dbClient, pipeline);
      logger.debug('CMS fetched');

      return api.sendCreated(res, api.createResponse(cms));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create CMS', 'sign-in.something-went-wrong'));
    }
  });
};

function insertCMS(dbClient, cmsId, type, caption, slug, content, author, picture, publishDate, tags) {
  const item = {
    _id: cmsId,
    type,
    info: {
      author: {
        nickname: author.nickname,
        id: author.userId,
      },
      caption,
      slug,
      published: false,
      date: publishDate,
      picture,
      tags,
    },
    data: {
      content: sanitizeHtml(content),
    },
  };

  return dbClient.db().collection('items').insertOne(item);
}
