const slugify = require('slugify');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const sanitizeHtml = require('sanitize-html');

dayjs.extend(customParseFormat);

const edjsHTML = require('editorjs-html');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

const edjsParser = edjsHTML(api.edjsHtmlCustomParser());

module.exports = (app) => {
  app.options('/v1/blog', auth.cors);

  app.post('/v1/blog', auth.required, auth.cors, async (req, res) => {
    logger.verbose('create blog handler starts');

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const {
        title, source, author, date, picture, tags,
      } = req.body;

      if (!source) {
        return api.sendBadRequest(res, api.createError('Missing parameter source', 'generic.internal-error'));
      }

      let user = auth.getIdentity(req.identity);
      if (author !== undefined && author.length > 0) {
        user = await mongo.getIdentity(dbClient, author);
        if (user === null) {
          return api.sendBadRequest(res, api.createError(`Author ${author} not found`, 'generic.internal-error'));
        }
      }

      let publishDate = new Date();
      if (date) {
        const dday = dayjs(date, 'YYYY-MM-DD');
        if (!dday.isValid()) {
          return api.sendBadRequest(res, api.createError(`Date ${date} is invalid`, 'generic.internal-error'));
        }
        publishDate = dday.toDate();
      }

      if (!picture) {
        return api.sendBadRequest(res, api.createError('Missing parameter picture', 'generic.internal-error'));
      }

      const blogId = mongo.generateTimeId();
      await insertItem(dbClient, blogId, title, source, user, publishDate, picture, tags);
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
  let content = '';
  edjsParser.parse(source).forEach((item) => {
    content += item;
  });
  content = sanitizeHtml(edjsParser.parse(source));
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
      date: publishDate,
      picture,
      tags,
    },
    data: {
      content,
      source,
    },
    comments: {
      count: 0,
      last: null,
    },
  };

  return dbClient.db().collection('items').insertOne(blog);
}
