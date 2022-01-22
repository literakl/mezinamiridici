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
  app.options('/v1/articles', auth.cors);

  app.post('/v1/articles', auth.required, auth.editorial_staff, auth.cors, async (req, res) => {
    logger.debug('create article handler starts');

    try {
      const {
        title, source, date, picture, tags, contentPictures,
      } = req.body;

      if (!title) {
        return api.sendMissingParam(res, 'title');
      }
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

      const dbClient = await mongo.connectToDatabase();
      let { author } = req.body;
      if (author && auth.checkRole(req, auth.ROLE_EDITOR_IN_CHIEF)) {
        author = await mongo.getIdentity(dbClient, author);
      } else {
        author = auth.getIdentity(req.identity);
      }

      const item = await insertItem(dbClient, title, source, author, publishDate, picture, tags);
      // we will consider articles as blogs from a user rank point of view
      await mongo.incrementUserActivityCounter(dbClient, req.identity.userId, 'blog', 'create');
      mongo.storePictureId(dbClient, item._id, contentPictures);
      logger.debug('Blog inserted');

      return api.sendCreated(res, api.createResponse(item));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create post', 'sign-in.something-went-wrong'));
    }
  });
};

// sync changes with parseAccidents.js
async function insertItem(dbClient, title, source, author, publishDate, picture, tags, sanitize = true, published = false) {
  const content = sanitize ? sanitizeHtml(source, api.sanitizeConfigure()) : source;
  const slug = slugify(title, { lower: true, strict: true });
  const adjustedSlug = await api.getSlug(slug, dbClient);

  const doc = {
    _id: mongo.generateTimeId(),
    type: 'article',
    info: {
      state: published ? 'published' : 'draft',
      date: publishDate,
      slug: adjustedSlug,
      author: {
        nickname: author.nickname,
        id: author.userId,
      },
      caption: title,
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

  await dbClient.db().collection('items').insertOne(doc);
  return doc;
}

module.exports.insertItem = insertItem;
