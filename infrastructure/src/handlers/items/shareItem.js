const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

const codes = ['facebook', 'twitter', 'messenger', 'whatsapp', 'email'];

module.exports = (app) => {
  app.options('/v1/items/:itemId/share', auth.cors);

  app.post('/v1/items/:itemId/share', auth.cors, async (req, res) => {
    logger.verbose('share link handler starts');
    const { itemId } = req.params;
    const { path, service, userId } = req.body;
    if (!codes.includes(service)) {
      return api.sendBadRequest(res, api.createError('Mismatch share code', 'generic.internal-error'));
    }
    if (!itemId || !path) {
      return api.sendBadRequest(res, api.createError('Missing parameter', 'generic.internal-error'));
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const url = createURL(service, path);
      await insertShare(dbClient, itemId, userId, service);
      logger.debug('Share recorded');

      return api.sendResponse(res, api.createResponse(url));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to record share', 'sign-in.something-went-wrong'));
    }
  });
};

function createURL(service, path) {
  const encodeURL = process.env.WEB_URL + path;
  let sendUrl = '';
  // eslint-disable-next-line default-case
  switch (service) {
    case 'facebook':
      sendUrl = `http://www.facebook.com/sharer/sharer.php?u=${encodeURL}`;
      break;
    case 'twitter':
      sendUrl = `http://www.twitter.com/share?url=${encodeURL}`;
      break;
    case 'messenger':
      sendUrl = `fb-messenger://share?link=${encodeURL}`;
      break;
    case 'email':
      sendUrl = `mailto:?body=${encodeURL}`;
      break;
    case 'whatsapp':
      sendUrl = `whatsapp://send?text=${encodeURL}`;
  }
  return sendUrl;
}

function insertShare(dbClient, item, user, service) {
  const theShare = {
    item,
    service,
    date: new Date(),
  };
  if (user) {
    theShare.user = user;
  }
  return dbClient.db().collection('link_shares').insertOne(theShare);
}
