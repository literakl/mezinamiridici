const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

require('../../utils/path_env');

const { MAXIMUM_PAGE_SIZE } = process.env || 50;
let { STREAM_PINNED_ITEMS } = process.env || 50;
if (STREAM_PINNED_ITEMS && (STREAM_PINNED_ITEMS.charAt(0) !== '[' || STREAM_PINNED_ITEMS.charAt(STREAM_PINNED_ITEMS.length - 1) !== ']')) {
  logger.error(`STREAM_PINNED_ITEMS does not look like JS array: '${STREAM_PINNED_ITEMS}', ignoring`);
  STREAM_PINNED_ITEMS = undefined;
}

module.exports = (app) => {
  app.options('/v1/item-stream', auth.cors);

  app.get('/v1/item-stream', auth.cors, async (req, res) => {
    logger.debug(`Get items ${JSON.stringify(req.query)}`);

    try {
      const dbClient = await mongo.connectToDatabase();
      const listParams = api.parseStreamParams(req, 20, MAXIMUM_PAGE_SIZE);
      const items = await getItems(dbClient, listParams, req);
      logger.debug('Items fetched');

      // const response = blendPinnedItems(dbClient, listParams, items);
      // return api.sendResponse(res, api.createResponse(response));
      return api.sendResponse(res, api.createResponse(items));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get items', 'sign-in.something-went-wrong'));
    }
  });
};

function getItems(dbClient, listParams, req) {
  const { tag } = req.query;
  const query = {
    'info.published': true,
    type: { $in: ['blog', 'poll'] },
    // 'info.date': { $lte: new Date() }, TODO
  };
  if (tag) {
    query['info.tags'] = tag;
  }

  return dbClient.db().collection('items')
    .find(query)
    .project({ type: 1, info: 1, comments: 1 })
    .sort({ 'info.date': -1 })
    .skip(listParams.start)
    .limit(listParams.pageSize)
    .toArray();
}

// function blendPinnedItems(dbClient, listParams, items) {
//   let x = dbClient + listParams + items;
//   if (STREAM_PINNED_ITEMS) {
//     x += 1; // TOOD
//     console.log(x);
//     eslint-disable-next-line no-eval
//     const config = eval(STREAM_PINNED_ITEMS);
//   }
//   return items;
// }
