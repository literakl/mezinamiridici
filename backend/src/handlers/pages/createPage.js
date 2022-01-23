const dayjs = require('dayjs');
const sanitizeHtml = require('sanitize-html');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/pages', auth.cors);

  app.post('/v1/pages', auth.required, auth.page_admin, auth.cors, async (req, res) => {
    logger.debug('Create page handler starts');
    const {
      caption, slug, content, contentPictures,
    } = req.body;
    if (!caption || !slug || !content) {
      return api.sendMissingParam(res, 'content');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      const user = auth.getIdentity(req.identity);
      const pageId = mongo.generateTimeId();
      Promise.all([
        insertPage(dbClient, pageId, caption, slug, content, user),
        mongo.logAdminActions(dbClient, user.userId, 'create page', pageId),
      ]);
      logger.debug('Page inserted');

      const page = await mongo.getContent(dbClient, null, pageId);
      logger.debug('Page fetched');

      mongo.storePictureId(dbClient, pageId, contentPictures);

      return api.sendCreated(res, api.createResponse(page));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create page', 'sign-in.something-went-wrong'));
    }
  });
};

async function insertPage(dbClient, pageId, caption, slug, content, author) {
  const item = {
    _id: pageId,
    type: 'page',
    info: {
      state: 'published',
      date: new Date(),
      slug,
      author: {
        nickname: author.nickname,
        id: author.userId,
      },
      caption,
      picture: 'none.jpg',
    },
    data: {
      content: sanitizeHtml(content, api.sanitizeConfigure()),
    },
    comments: {
      count: 0,
      last: null,
    },
  };

  return dbClient.db().collection('items').insertOne(item);
}
