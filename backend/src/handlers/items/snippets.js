const auth = require('../../utils/authenticate');
const api = require('../../utils/api.js');
const mongo = require('../../utils/mongo.js');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/items/:itemId/snippets', auth.cors);
  app.options('/v1/items/:itemId/snippets/:code', auth.cors);

  app.get('/v1/items/:itemId/snippets', auth.required, auth.editorial_staff, auth.cors, async (req, res) => {
    logger.trace('get snippets handler starts');
    const { itemId } = req.params;
    try {
      const dbClient = await mongo.connectToDatabase();
      const item = await mongo.getContent(dbClient, undefined, itemId);
      if (item.info.author.id !== req.identity.userId && !auth.checkRole(req, auth.editor_in_chief)) {
        return api.sendErrorForbidden(res, api.createError('You are not authorized to perform this action'));
      }
      return api.sendResponse(res, api.createResponse(item.snippets ? item.snippets : []));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get snippets', 'sign-in.something-went-wrong'));
    }
  });

  app.post('/v1/items/:itemId/snippets', auth.required, auth.editor_in_chief, auth.cors, async (req, res) => {
    logger.trace('create snippet handler starts');
    const {
      code, type, object,
    } = req.body;

    const { itemId } = req.params;
    if (!code) {
      return api.sendMissingParam(res, 'code');
    }
    if (!type) {
      return api.sendMissingParam(res, 'type');
    }
    if (!object) {
      return api.sendMissingParam(res, 'object');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug(`Creating snippet ${code} for item ${itemId}`);
      const item = await mongo.getContent(dbClient, undefined, itemId);
      logger.debug('Item fetched');
      if (item.type !== 'article' && item.type !== 'page') {
        return api.sendInvalidParam(res, api.createError(`Incompatible type ${item.type}`, 'sign-in.something-went-wrong'));
      }

      const user = auth.getIdentity(req.identity);
      const snippet = await insertItem(dbClient, item._id, code.toLowerCase(), type.toLowerCase(), user, object);
      return api.sendCreated(res, api.createResponse(snippet));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create snippet', 'sign-in.something-went-wrong'));
    }
  });

  app.patch('/v1/items/:itemId/snippets/:code', auth.required, auth.editor_in_chief, auth.cors, async (req, res) => {
    logger.trace('update snippet handler starts');
    const { itemId } = req.params;
    const currentCode = req.params.code;
    if (!currentCode) {
      return api.sendMissingParam(res, 'code');
    }
    const {
      code, type, object,
    } = req.body;
    if (!code) {
      return api.sendMissingParam(res, 'code');
    }
    if (!type) {
      return api.sendMissingParam(res, 'type');
    }
    if (!object) {
      return api.sendMissingParam(res, 'object');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug(`Updating snippet ${currentCode} of blog ${itemId}`);

      const item = await mongo.getContent(dbClient, undefined, itemId);
      if (!item.snippets) {
        return api.sendNotFound(res, api.createError(`No snippets in item ${itemId}`, 'sign-in.something-went-wrong'));
      }

      let snippets = item.snippets.filter(x => x.code !== currentCode);
      if (snippets.length === item.snippets.length) {
        return api.sendInvalidParam(res, api.createError(`Snippet ${currentCode} not found in item ${itemId}`, 'sign-in.something-went-wrong'));
      }

      const user = auth.getIdentity(req.identity);
      const snippet = { code: code.toLowerCase(), type: type.toLowerCase(), date: new Date(), user };
      snippet[snippet.type] = object;
      snippets.push(snippet);

      const result = await dbClient.db().collection('items').updateOne({ _id: itemId }, { $set: { snippets } });
      // todo mongo log admin

      if (result.modifiedCount === 1) {
        logger.debug('Snippet updated');
        return api.sendResponse(res, api.createResponse(snippet));
      } else {
        logger.error('Snippet not updated');
        return api.sendInternalError(res, api.createError('Failed to update snippet', 'sign-in.something-went-wrong'));
      }
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to update snippet', 'sign-in.something-went-wrong'));
    }
  });

  app.delete('/v1/items/:itemId/snippets/:code', auth.required, auth.editor_in_chief, auth.cors, async (req, res) => {
    logger.trace('delete snippet handler starts');
    const { itemId, code } = req.params;
    if (!code) {
      return api.sendMissingParam(res, 'code');
    }
    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug(`Deleting snippet ${code} from item ${itemId}`);

      const item = await mongo.getContent(dbClient, undefined, itemId);
      if (!item.snippets) {
        return api.sendInvalidParam(res, api.createError(`No snippets in item ${itemId}`, 'sign-in.something-went-wrong'));
      }

      item.snippets = item.snippets.filter(snippet => snippet.code !== code);
      const result = await dbClient.db().collection('items').updateOne({ _id: itemId }, { $set: { snippets: item.snippets } });
      // todo mongo log admin

      if (result.modifiedCount === 1) {
        logger.debug('Snippet deleted');
        return api.sendResponse(res, api.createResponse());
      } else {
        logger.error('Snippet not deleted');
        return api.sendInternalError(res, api.createError('Failed to update snippet', 'sign-in.something-went-wrong'));
      }
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to delete snippet', 'sign-in.something-went-wrong'));
    }
  });
};

async function insertItem(dbClient, itemId, code, type, user, object) {
  const snippet = {
    code,
    user: {
      nickname: user.nickname,
      id: user.userId,
    },
    type,
    date: new Date(),
  };
  snippet[type] = object;

  const result = await dbClient.db().collection('items').updateOne({ _id: itemId }, { $push: {snippets: snippet } });
  if (result.modifiedCount === 1) {
    logger.debug('Snippet inserted');
    return snippet;
  } else {
    logger.error('Snippet not inserted');
    return null;
  }
}
