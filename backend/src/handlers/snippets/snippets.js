const auth = require('../../utils/authenticate');
const api = require('../../utils/api.js');
const mongo = require('../../utils/mongo.js');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/posts/:blogId/snippets', auth.cors);
  app.options('/v1/posts/:blogId/snippets/:code', auth.cors);

  app.get('/v1/posts/:blogId/snippets', auth.required, auth.staffer, auth.cors, async ( req, res ) => {
    logger.debug('get snippets handler starts');
    // find all documents in snippets collection where itemId is blogId
    const { blogId } = req.params;
    if (!blogId) {
      return api.sendMissingParam(res, 'blogId');
    }
    try {
      const dbClient = await mongo.connectToDatabase();
      const snippets = await mongo.getAllSnippets(dbClient, blogId);
      logger.debug('Snippets fetched');

      if (!snippets) {
        return api.sendNotFound(res, api.createError('Snippets not found', 'generic.not-found-caption'));
      }
      return api.sendResponse(res, api.createResponse(snippets));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get snippets', 'sign-in.something-went-wrong'));
    }
  });

  app.post('/v1/posts/:blogId/snippets', auth.required, auth.editor_in_chief, auth.cors, async (req, res ) => {
    logger.debug('create snippet handler starts');
    // insert new document into snippets collection with itemId set to blogId
    const {
      code, type, content, date
    } = req.body;

    const { blogId } = req.params;
    if (!blogId) {
      return api.sendMissingParam(res, 'blogId');
    }
    if (!code) {
      return api.sendMissingParam(res, 'code');
    }
    if (!type) {
      return api.sendMissingParam(res, 'type');
    }
    if (!content) {
      return api.sendMissingParam(res, 'content');
    } 
    const publishDate = api.parseDate(date, 'YYYY-MM-DD HH:mm:ss');
    if (!publishDate) {
      return api.sendInvalidParam(res, 'date', date);
    }

    try{
      const dbClient = await mongo.connectToDatabase();
      const user = auth.getIdentity(req.identity);
      const snippetId = mongo.generateTimeId();

      const blog = await mongo.getBlog(dbClient, undefined, blogId);
      logger.debug('Blog fetched');
      
      await insertItem(dbClient,snippetId,blog._id,code,user,publishDate,type,content);
      logger.debug('Snippet inserted');
      
      const snippet = await mongo.getSnippet(dbClient, snippetId);
      logger.debug('Snippet fetched');

      return api.sendCreated(res, api.createResponse(snippet));
    }
    catch(err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create snippet', 'sign-in.something-went-wrong'));
    }
  });

  app.patch('/v1/posts/:blogId/snippets/:code', auth.required, auth.editor_in_chief, auth.cors, async ( req, res ) => {
    logger.debug('update snippet handler starts');
    // update document from snippets collection with itemId set to blogId and given code
    const { blogId,code } = req.params;
    if (!blogId) {
      return api.sendMissingParam(res, 'blogId');
    }
    if (!code) {
      return api.sendMissingParam(res, 'code');
    }
    try {
      const dbClient = await mongo.connectToDatabase();
      const snippet = await mongo.updateSnippet(dbClient, blogId, code);
      logger.debug('Snippet updated');

      if (!snippet) {
        return api.sendNotFound(res, api.createError('Snippets not found', 'generic.not-found-caption'));
      }
      return api.sendResponse(res, api.createResponse(snippet));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to update snippets', 'sign-in.something-went-wrong'));
    }
  });

  app.delete('/v1/posts/:blogId/snippets/:code', auth.required, auth.editor_in_chief, auth.cors, async ( req, res ) => {
    logger.debug('delete snippet handler starts');
    // delete document from snippets collection with itemId set to blogId and given code
    const { blogId,code } = req.params;
    if (!blogId) {
      return api.sendMissingParam(res, 'blogId');
    }
    if (!code) {
      return api.sendMissingParam(res, 'code');
    }
    try {
      const dbClient = await mongo.connectToDatabase();
      const snippet = await mongo.deleteSnippet(dbClient, blogId, code);
      logger.debug('Snippet deleted');

      if (!snippet) {
        return api.sendNotFound(res, api.createError('Snippets not found', 'generic.not-found-caption'));
      }
      return api.sendResponse(res, api.createResponse(snippet));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to delete snippets', 'sign-in.something-went-wrong'));
    }
  });
};
async function insertItem(dbClient,snippetId,blogId,code,user,date,type,content){
const snippet={
  _id: snippetId,
  itemId: blogId,
  code:code,
  user:{
    nickname:user.nickname,
    id:user.userId
  },
  date:date,
  type:type,
  content:content,
}
return dbClient.db().collection('snippets').insertOne(snippet);
}
