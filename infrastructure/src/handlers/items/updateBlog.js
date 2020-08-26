const sanitizeHtml = require('sanitize-html');
const edjsHTML = require('editorjs-html');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

const edjsParser = edjsHTML(api.edjsHtmlCustomParser());

module.exports = (app) => {
  app.options('/v1/blog/:blogId', auth.cors);

  app.patch('/v1/blog/:blogId', auth.required, auth.cors, async (req, res) => {
    logger.verbose('update blog handler starts');
    const { blogId } = req.params;
    if (!blogId) {
      return api.sendBadRequest(res, api.createError('Missing parameter blogId', 'generic.internal-error'));
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const {
        source, title, picture, tags,
      } = req.body;

      if (!source) {
        return api.sendBadRequest(res, api.createError('Missing parameter source', 'generic.internal-error'));
      }

      if (!picture) {
        return api.sendBadRequest(res, api.createError('Missing parameter picture', 'generic.internal-error'));
      }

      const query = prepareUpdateQuery(source, title, picture, tags);
      await dbClient.db().collection('items').updateOne({ _id: blogId }, query);
      logger.debug('Blog updated');

      const blog = await mongo.getBlog(dbClient, undefined, blogId);
      logger.debug('Updated blog fetched');
      return api.sendResponse(res, api.createResponse(blog));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create poll', 'sign-in.something-went-wrong'));
    }
  });
};

function prepareUpdateQuery(source, title, picture, tags) {
  let content = '';
  edjsParser.parse(source).forEach((item) => {
    content += item;
  });
  content = sanitizeHtml(edjsParser.parse(source));

  const setters = {};
  setters['data.source'] = source;
  setters['data.content'] = content;
  setters['info.caption'] = title;
  setters['info.picture'] = picture;
  setters['info.tags'] = tags;

  const query = { };
  query.$set = setters;

  return query;
}
