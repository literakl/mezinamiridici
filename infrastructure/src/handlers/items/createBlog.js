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
  app.options('/v1/blog', auth.cors);

  app.post('/v1/blog', auth.required, auth.cors, async (req, res) => {
    logger.verbose('create blog handler starts');

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const {
        title, source,
      } = req.body;
      
      if (!source) {
        return api.sendBadRequest(res, api.createError('Missing parameter source', 'generic.internal-error'));
      }
      const content = edjsParser.parse(source);

      let user = auth.getIdentity(req.identity);

      let publishDate = new Date();
      
      const blogId = mongo.generateTimeId();
      await insertItem(dbClient, blogId, title, source, content, user, publishDate);
      logger.debug('Blog inserted');

      const pipeline = [mongo.stageId(blogId)];
      const blog = await mongo.getPoll(dbClient, pipeline);
      logger.debug('Poll fetched');

      return api.sendCreated(res, api.createResponse(blog));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create poll', 'sign-in.something-went-wrong'));
    }
  });
};

function insertItem(dbClient, blogId, title, source, content, user, publishDate) {
  const blog = {
    _id: blogId,
    type: 'blog',
    date: publishDate,
    user: user.userId,
    title,
    source,
    content,
  };

  return dbClient.db().collection('blogs').insertOne(blog);
}
