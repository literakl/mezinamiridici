const slugify = require('slugify');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

const edjsHTML = require("editorjs-html");
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
        source, title, date,
      } = req.body;

      if (!source) {
        return api.sendBadRequest(res, api.createError('Missing parameter source', 'generic.internal-error'));
      }
      const content = edjsParser.parse(source);

      let user = auth.getIdentity(req.identity);

      let publishDate = new Date();

      const query = prepareUpdateQuery(source, content, user, title, publishDate);
      await dbClient.db().collection('blogs').updateOne({ _id: blogId }, query);
      logger.debug('Blog updated');

      const pipeline = [mongo.stageId(blogId)];
      const item = await getBlog(dbClient, pipeline);
      logger.debug('Updated blog fetched');
      return api.sendResponse(res, api.createResponse(item));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create poll', 'sign-in.something-went-wrong'));
    }
  });
};

function prepareUpdateQuery(source,content, author, title, date) {
  const setters = {};
  setters['source'] = source;
  setters['content'] = content;
  setters['title'] = title;
  setters['user'] = author.userId;
  setters['date'] = date;
  
  
  const query = { };
  query.$set = setters;
  
  return query;
}


async function getBlog(dbClient, pipeline) {
  const cursor = dbClient.db().collection('blogs').aggregate(pipeline);
  const blog = await cursor.next();
  
  return blog;
}
