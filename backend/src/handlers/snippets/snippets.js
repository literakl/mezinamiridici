const auth = require('../../utils/authenticate');
const api = require('../../utils/api.js');
const mongo = require('../../utils/mongo.js');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/posts/:blogId/snippets', auth.cors);
  app.options('/v1/posts/:blogId/snippets/:code', auth.cors);

  app.get('/v1/posts/:blogId/snippets', auth.required, auth.editorial_staff, auth.cors, async (req, res) => {
    logger.debug('get snippets handler starts');
    // find all documents in snippets collection where itemId is blogId
    const { blogId } = req.params;
    if (!blogId) {
      return api.sendMissingParam(res, 'blogId');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      const blog = await mongo.getBlog(dbClient, undefined, blogId);
      if (blog.info.author.id !== req.identity.userId) {
        return api.sendErrorForbidden(res, api.createError('You are not authorized to perform this action'));
      }

      const snippets = await dbClient.db().collection('snippets').find({ itemId: blogId }).toArray();
      logger.debug('Snippets fetched');

      return api.sendResponse(res, api.sendResponse(snippets || []));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get snippets', 'sign-in.something-went-wrong'));
    }
  });

  app.post('/v1/posts/:blogId/snippets', auth.required, auth.editor_in_chief, auth.cors, async (req, res) => {
    logger.debug('create snippet handler starts');
    // insert new document into snippets collection with itemId set to blogId
    const {
      code, type, content, date,
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
    const publishDate = new Date();
    if (!publishDate) {
      return api.sendInvalidParam(res, 'date', date);
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      const user = auth.getIdentity(req.identity);
      const snippetId = mongo.generateTimeId();

      const blog = await mongo.getBlog(dbClient, undefined, blogId);
      logger.debug('Blog fetched');

      await insertItem(dbClient, snippetId, blog._id, code, user, publishDate, type, content);
      logger.debug('Snippet inserted');

      const snippet = await getSnippet(dbClient, snippetId);
      logger.debug('Snippet fetched');

      return api.sendCreated(res, api.createResponse(snippet));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create snippet', 'sign-in.something-went-wrong'));
    }
  });

  app.patch('/v1/posts/:blogId/snippets/:code', auth.required, auth.editor_in_chief, auth.cors, async (req, res) => {
    logger.debug('update snippet handler starts');
    // update document from snippets collection with itemId set to blogId and given code
    const { blogId, code } = req.params;
    if (!blogId) {
      return api.sendMissingParam(res, 'blogId');
    }
    if (!code) {
      return api.sendMissingParam(res, 'code');
    }
    try {
      const dbClient = await mongo.connectToDatabase();
      const snippet = await updateSnippet(dbClient, blogId, code);
      logger.debug('Snippet updated');

      if (!snippet) {
        return api.sendResponse(res, api.createError('Snippets not found', 'generic.not-found-caption'));
      }
      return api.sendResponse(res, api.createResponse(snippet));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to update snippets', 'sign-in.something-went-wrong'));
    }
  });

  app.delete('/v1/posts/:blogId/snippets/:code', auth.required, auth.editor_in_chief, auth.cors, async (req, res) => {
    logger.debug('delete snippet handler starts');
    // delete document from snippets collection with itemId set to blogId and given code
    const { blogId, code } = req.params;
    if (!blogId) {
      return api.sendMissingParam(res, 'blogId');
    }
    if (!code) {
      return api.sendMissingParam(res, 'code');
    }
    try {
      const dbClient = await mongo.connectToDatabase();
      const result = await deleteSnippet(dbClient, blogId, code);
      logger.debug('Snippet deleted');

      if (result.result.n === 1 && result.result.ok === 1) {
        return api.sendResponse(res, api.createResponse(result));
      }
      return api.sendResponse(res, api.createError('Snippets not found', 'generic.not-found-caption'));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to delete snippets', 'sign-in.something-went-wrong'));
    }
  });
};
async function insertItem(dbClient, snippetId, blogId, code, user, date, type, content) {
  const snippet = {
    _id: snippetId,
    itemId: blogId,
    code,
    user: {
      nickname: user.nickname,
      id: user.userId,
    },
    date,
    type,
    content,
  };
  return dbClient.db().collection('snippets').insertOne(snippet);
}

async function getSnippet(dbClient, snippetId) {
  if (snippetId) {
    return dbClient.db().collection('snippets').findOne({ _id: snippetId });
  }
  throw new Error('Snippet id is empty');
}

async function updateSnippet(dbClient, blogId, code) {
  if (blogId) {
    return dbClient.db().collection('snippets').findOneAndUpdate({ itemId: blogId }, { $set: { code } });
  }
  throw new Error('blog id is empty');
}

async function deleteSnippet(dbClient, blogId, code) {
  if (blogId) {
    return dbClient.db().collection('snippets').deleteOne({ itemId: blogId, code });
  }
  throw new Error('blog id is empty');
}
