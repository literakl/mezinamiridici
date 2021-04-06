const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

require('../../utils/path_env');

const { MAXIMUM_PAGE_SIZE } = process.env || 50;
let { STREAM_PINNED_ITEMS } = process.env || [];
let PINNED_ITEMS = configurePinnedItems();

module.exports = (app) => {
  app.options('/v1/item-stream', auth.cors);

  app.get('/v1/item-stream', auth.cors, async (req, res) => {
    logger.debug(`Get items ${JSON.stringify(req.query)}`);

    try {
      const listParams = api.parseStreamParams(req, 20, MAXIMUM_PAGE_SIZE);
      const { tag } = req.query;
      const response = await blendPinnedItems(listParams, tag);
      return api.sendResponse(res, api.createResponse(response));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get items', 'sign-in.something-went-wrong'));
    }
  });
};

function getItems(dbClient, tag, start, pageSize) {
  const query = {
    type: { $in: ['blog', 'poll'] },
    'info.published': true,
  };
  if (start === 0) {
    query['info.date'] = { $lte: new Date() };
  }
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

function getItem(dbClient, slug) {
  return dbClient.db().collection('items')
    .findOne({ 'info.slug': slug }, { projection: { type: 1, info: 1, comments: 1 } });
}

/*
odecti od startu, kolik pozic je pred ni
presun na spravnou pozici pinned item, pokud je ve strance
jinak stahni polozku a vloz ji na pozici dle konfigurace pinned item
opakuj pro vsechny pinned item ze stranky
umaz prebytecne polozky
*/
async function blendPinnedItems(listParams, tag) {
  logger.debug('Blending items start');
  let shift = 0;
  const currentPage = [];

  const iterator = PINNED_ITEMS.byPosition.keys();
  let result = iterator.next();
  while (!result.done) {
    const position = result.value;
    if (position < listParams.start) {
      shift += 1;
    } else if (position < (listParams.start + listParams.pageSize)) {
      currentPage.push(position);
    }
    result = iterator.next();
  }

  const dbClient = await mongo.connectToDatabase();
  let items = await getItems(dbClient, tag, listParams.start - shift, listParams.pageSize);
  logger.debug('Items fetched');

  if (currentPage.length === 0) {
    return items;
  }

  for (let i = 0; i < currentPage.length; i += 1) {
    const position = currentPage[i];
    const slug = PINNED_ITEMS.byPosition.get(position);
    const foundAt = items.findIndex(item => item.info.slug === slug);
    if (foundAt !== -1) {
      // move an item within the page to its requested position
      const arr = [...items];
      arr.splice(position, 0, ...arr.splice(foundAt, 1));
      items = arr;
    } else {
      // fetch item and insert it at its requested position
      // eslint-disable-next-line no-await-in-loop
      const item = await getItem(dbClient, slug);
      if (item) {
        items.splice(position, 0, item);
      }
    }
  }

  if (items.length > listParams.pageSize) {
    // items = items.slice(listParams.pageSize);
    items.splice(listParams.pageSize);
  }

  logger.debug('Blending items finished');
  return items;
}

function configurePinnedItems() {
  if (STREAM_PINNED_ITEMS && (STREAM_PINNED_ITEMS.charAt(0) !== '[' || STREAM_PINNED_ITEMS.charAt(STREAM_PINNED_ITEMS.length - 1) !== ']')) {
    logger.error(`STREAM_PINNED_ITEMS does not look like JS array: '${STREAM_PINNED_ITEMS}', ignoring`);
    STREAM_PINNED_ITEMS = [];
  }

  const pinnedItems = { byPosition: new Map(), bySlug: new Map() };
  if (STREAM_PINNED_ITEMS.length > 0) {
    let pinnedArray;
    try {
      // eslint-disable-next-line no-eval
      pinnedArray = eval(STREAM_PINNED_ITEMS);
    } catch (e) {
      logger.error(`Failed to evaluate STREAM_PINNED_ITEMS '${STREAM_PINNED_ITEMS}'`);
      return pinnedItems;
    }

    pinnedArray.sort((a, b) => a.position - b.position);
    pinnedArray.forEach((item) => {
      pinnedItems.byPosition.set(item.position, item.slug);
      pinnedItems.bySlug.set(item.slug, item.position);
    });
  }
  return pinnedItems;
}

function setPinnedItems(items) {
  STREAM_PINNED_ITEMS = items;
  PINNED_ITEMS = configurePinnedItems();
}

module.exports.setPinnedItems = setPinnedItems;
