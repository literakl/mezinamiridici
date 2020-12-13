const slugify = require('slugify');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const sanitizeHtml = require('sanitize-html');

dayjs.extend(customParseFormat);

const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/blog', auth.cors);

  app.post('/v1/blog', auth.required, auth.cors, async (req, res) => {
    logger.verbose('create blog handler starts');

    const {
      title, source, date, picture, tags,
    } = req.body;
    if (!source) {
      return api.sendMissingParam(res, 'source');
    }
    const publishDate = api.parseDate(date, 'YYYY-MM-DD HH:mm:ss');
    if (!publishDate) {
      return api.sendInvalidParam(res, 'date', date);
    }
    if (!picture) {
      return api.sendMissingParam(res, 'picture');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const user = auth.getIdentity(req.identity);
      const blogId = mongo.generateTimeId();
      await insertItem(dbClient, blogId, title, source, user, publishDate, picture, tags);
      await mongo.incrementUserActivityCounter(dbClient, req.identity.userId, 'blog', 'create');
      logger.debug('Blog inserted');

      const blog = await mongo.getBlog(dbClient, undefined, blogId);
      logger.debug('Blog fetched');

      return api.sendCreated(res, api.createResponse(blog));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create post', 'sign-in.something-went-wrong'));
    }
  });
};

function insertItem(dbClient, blogId, title, source, author, publishDate, picture, tags) {
  const content = sanitizeHtml(source, api.sanitizeConfigure());
  const slug = slugify(title, { lower: true, strict: true });

  const blog = {
    _id: blogId,
    type: 'blog',
    info: {
      author: {
        nickname: author.nickname,
        id: author.userId,
      },
      caption: title,
      slug,
      published: true,
      date: publishDate,
      picture,
      tags,
    },
    data: {
      content,
    },
    comments: {
      count: 0,
      last: null,
    },
  };

  return dbClient.db().collection('items').insertOne(blog);
}
