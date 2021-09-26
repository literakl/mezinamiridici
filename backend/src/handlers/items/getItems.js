const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

require('../../utils/path_env');

const { MAXIMUM_PAGE_SIZE } = process.env || 50;
let { STREAM_PINNED_ITEMS } = process.env || [];
let pinnedItems = configurePinnedItems(STREAM_PINNED_ITEMS);

module.exports = (app) => {
  app.options('/v1/item-stream', auth.cors);

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

  app.options('/v1/item-stream/pinned', auth.cors);

  app.get('/v1/item-stream/pinned', auth.cors, async (req, res) => {
    logger.debug('Get pinned items');
    const dbClient = await mongo.connectToDatabase();
    const items = await getItems(dbClient, { 'info.slug': { $in: pinnedItems.slugs } });
    const result = [];
    items.forEach((item) => {
      const position = pinnedItems.map.get(item.info.slug);
      result.push({ position, item });
    });
    result.sort((a, b) => a.position - b.position);
    return api.sendResponse(res, api.createResponse(result));
  });
};

function getItemsPage(dbClient, tag, start, pageSize) {
  const query = {
    type: { $in: ['blog', 'poll'] },
    'info.published': true,
    'info.date': { $lte: new Date() },
    'info.hidden':false
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

function getItems(dbClient, query) {
  return dbClient.db().collection('items')
    .find(query, { projection: { type: 1, info: 1, comments: 1 } })
    .toArray();
}

function configurePinnedItems() {
  if (STREAM_PINNED_ITEMS) {
    if (STREAM_PINNED_ITEMS.charAt(0) !== '[' || STREAM_PINNED_ITEMS.charAt(STREAM_PINNED_ITEMS.length - 1) !== ']') {
      logger.error(`STREAM_PINNED_ITEMS does not look like JS array: '${STREAM_PINNED_ITEMS}', ignoring`);
      STREAM_PINNED_ITEMS = '[]';
    }
  } else {
    STREAM_PINNED_ITEMS = '[]';
  }

  const result = { map: new Map(), slugs: [] };
  if (STREAM_PINNED_ITEMS.length > 2) {
    let pinnedArray;
    try {
      // eslint-disable-next-line no-eval
      pinnedArray = eval(STREAM_PINNED_ITEMS);
    } catch (e) {
      logger.error(`Failed to evaluate STREAM_PINNED_ITEMS '${STREAM_PINNED_ITEMS}'`);
      return result;
    }

    pinnedArray.sort((a, b) => a.position - b.position);
    pinnedArray.forEach((config) => {
      result.slugs.push(config.slug);
      result.map.set(config.slug, config.position);
    });
  }
  return result;
}

function setPinnedItems(items) {
  STREAM_PINNED_ITEMS = items;
  pinnedItems = configurePinnedItems();
}

module.exports.setPinnedItems = setPinnedItems;
