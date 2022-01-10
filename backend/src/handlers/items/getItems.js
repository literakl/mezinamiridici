const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

require('../../utils/path_env');

const { MAXIMUM_PAGE_SIZE } = process.env || 50;

module.exports = (app) => {
  app.options('/v1/item-stream', auth.cors);
  app.options('/bff/articles', auth.cors);
  app.options('/v1/content/:slug', auth.cors);

  app.get('/v1/item-stream', auth.cors, async (req, res) => {
    logger.debug('Get items'); // ${JSON.stringify(req.query)}

    try {
      const listParams = api.parseStreamParams(req, 20, MAXIMUM_PAGE_SIZE);
      const { tag } = req.query;
      const dbClient = await mongo.connectToDatabase();
      const result = await getItemsPage(dbClient, tag, listParams.start, listParams.pageSize);
      return api.sendResponse(res, api.createResponse(result));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get items', 'sign-in.something-went-wrong'));
    }
  });

  app.get('/v1/content/:slug', async (req, res) => {
    logger.debug('Get content by slug handler starts');
    const { slug } = req.params;

    try {
      const dbClient = await mongo.connectToDatabase();
      const item = await mongo.getContent(dbClient, slug);
      logger.debug('Item fetched');

      if (!item) {
        return api.sendNotFound(res, api.createError('Page not found', 'generic.not-found-caption'));
      }
      return api.sendResponse(res, api.createResponse(item));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get page', 'sign-in.something-went-wrong'));
    }
  });

  app.get('/bff/articles', auth.required, auth.cors, async (req, res) => {
    logger.debug('get articles');
    try {
      const listParams = api.parseStreamParams(req, 20, MAXIMUM_PAGE_SIZE);
      const editor = auth.checkRole(req, auth.ROLE_EDITOR_IN_CHIEF);
      const author = auth.checkRole(req, auth.ROLE_STAFFER);
      if (!editor && !author) {
        return api.sendErrorForbidden(res, api.createError('You are not authorized'));
      }

      const dbClient = await mongo.connectToDatabase();
      const result = await getArticlesPage(dbClient, (!editor) ? req.identity : null, listParams.start, listParams.pageSize);
      return api.sendResponse(res, api.createResponse(result));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get articles', 'sign-in.something-went-wrong'));
    }
  });
};

function getItemsPage(dbClient, tag, start, pageSize) {
  const query = {
    type: { $in: ['blog', 'article', 'poll'] },
    'info.state': 'published',
    'info.date': { $lte: new Date() },
  };
  if (tag) {
    query['info.tags'] = tag;
  }

  return dbClient.db().collection('items')
    .find(query)
    .project({ type: 1, info: 1, comments: 1 })
    .sort({ 'info.date': -1 })
    .skip(start)
    .limit(pageSize)
    .toArray();
}

function getArticlesPage(dbClient, author, start, pageSize) {
  const query = {
    type: 'article',
  };
  if (author) {
    query['info.author.id'] = author.userId;
  }

  return dbClient.db().collection('items')
    .find(query)
    .project({ info: 1, comments: 1 })
    .sort({ 'info.date': -1 })
    .skip(start)
    .limit(pageSize)
    .toArray();
}
