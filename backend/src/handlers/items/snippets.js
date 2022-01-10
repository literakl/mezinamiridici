const auth = require('../../utils/authenticate');
const api = require('../../utils/api.js');
const mongo = require('../../utils/mongo.js');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/items/:itemId/snippets', auth.cors);
  app.options('/v1/items/:itemId/snippets/:code', auth.cors);

  app.get('/v1/items/:itemId/snippets', auth.required, auth.editorial_staff, auth.cors, async (req, res) => {
    logger.trace('get snippets handler starts');
    // find all documents in snippets collection where itemId is itemId
    const { itemId } = req.params;
    if (!itemId) {
      return api.sendMissingParam(res, 'itemId');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      const blog = await mongo.getContent(dbClient, undefined, itemId);
      if (blog.info.author.id !== req.identity.userId) { // todo editor in chief shall pass through as well
        return api.sendErrorForbidden(res, api.createError('You are not authorized to perform this action'));
      }

      const snippets = await dbClient.db().collection('snippets').find({ itemId: itemId }).toArray();
      logger.trace('Snippets fetched');

      return api.sendResponse(res, api.createResponse(snippets));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get snippets', 'sign-in.something-went-wrong'));
    }
  });

  app.post('/v1/items/:itemId/snippets', auth.required, auth.editor_in_chief, auth.cors, async (req, res) => {
    logger.trace('create snippet handler starts');
    const {
      code, type, content, date,
    } = req.body;

    const { itemId } = req.params;
    if (!itemId) {
      return api.sendMissingParam(res, 'itemId');
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
      logger.debug(`Creating snippet ${code} of blog ${itemId}`);
      const user = auth.getIdentity(req.identity);
      const snippetId = mongo.generateTimeId();

      const blog = await mongo.getContent(dbClient, undefined, itemId);
      logger.debug('Blog fetched');

      await insertItem(dbClient, snippetId, blog._id, code, user, publishDate, type, content);
      logger.debug('Snippet inserted');
      // todo mongo log admin

      const snippet = await getSnippet(dbClient, snippetId);
      return api.sendCreated(res, api.createResponse(snippet));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create snippet', 'sign-in.something-went-wrong'));
    }
  });

  app.patch('/v1/items/:itemId/snippets/:code', auth.required, auth.editor_in_chief, auth.cors, async (req, res) => {
    logger.trace('update snippet handler starts');
    // update document from snippets collection with itemId set to itemId and given code
    const { itemId } = req.params;
    if (!itemId) {
      return api.sendMissingParam(res, 'itemId');
    }
    const currentCode = req.params.code;
    if (!currentCode) {
      return api.sendMissingParam(res, 'code');
    }
    const {
      code, type, content,
    } = req.body;
    if (!code) {
      return api.sendMissingParam(res, 'code');
    }
    if (!type) {
      return api.sendMissingParam(res, 'type');
    }
    if (!content) {
      return api.sendMissingParam(res, 'content');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug(`Updating snippet ${currentCode} of blog ${itemId}`);
      const result = await updateSnippet(dbClient, itemId, currentCode, code, type, content);
      logger.debug('Snippet updated');
      // todo mongo log admin

      if (result.ok === 1) {
        const snippet = await getSnippet(dbClient, result.value._id);
        return api.sendResponse(res, api.createResponse(snippet));
      }
      return api.sendNotFound(res, api.createError('Snippet not found', 'generic.not-found-caption'));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to update snippet', 'sign-in.something-went-wrong'));
    }
  });

  app.delete('/v1/items/:itemId/snippets/:code', auth.required, auth.editor_in_chief, auth.cors, async (req, res) => {
    logger.trace('delete snippet handler starts');
    // delete document from snippets collection with itemId set to itemId and given code
    const { itemId, code } = req.params;
    if (!itemId) {
      return api.sendMissingParam(res, 'itemId');
    }
    if (!code) {
      return api.sendMissingParam(res, 'code');
    }
    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug(`Deleting snippet ${code} of blog ${itemId}`);
      const result = await deleteSnippet(dbClient, itemId, code);
      logger.debug('Snippet deleted');
      // todo mongo log admin

      if (result.deletedCount !== 1) {
        return api.sendNotFound(res, api.createError('Snippet not found', 'generic.not-found-caption'));
      } else {
        return api.sendResponse(res, api.createResponse(result));
      }
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to delete snippet', 'sign-in.something-went-wrong'));
    }
  });
};

async function insertItem(dbClient, snippetId, itemId, code, user, date, type, content) {
  const snippet = {
    _id: snippetId,
    itemId: itemId,
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

async function updateSnippet(dbClient, itemId, currentCode, code, type, content) {
  return dbClient.db().collection('snippets').findOneAndUpdate({ itemId: itemId, code: currentCode }, { $set: { code, type, content } });
}

async function deleteSnippet(dbClient, itemId, code) {
  return dbClient.db().collection('snippets').deleteOne({ itemId: itemId, code });
}
