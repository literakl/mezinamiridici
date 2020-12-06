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

  app.post('/v1/pages', auth.required, auth.cms_admin, auth.cors, async (req, res) => {
    logger.verbose('Create page handler starts');
    const {
      caption, slug, content,
    } = req.body;
    if (!caption || !slug || !content) {
      return api.sendMissingParam(res, 'content');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const user = auth.getIdentity(req.identity);
      const pageId = mongo.generateTimeId();
      await insertPage(dbClient, pageId, caption, slug, content, user);
      logger.debug('Page inserted');

      const pipeline = [mongo.stageId(pageId)];
      const page = await mongo.getPage(dbClient, pipeline);
      logger.debug('Page fetched');

      return api.sendCreated(res, api.createResponse(page));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create page', 'sign-in.something-went-wrong'));
    }
  });
};

function insertPage(dbClient, pageId, caption, slug, content, author) {
  const item = {
    _id: pageId,
    type: 'page',
    info: {
      author: {
        nickname: author.nickname,
        id: author.userId,
      },
      caption,
      slug,
      published: true,
      date: new Date(),
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
