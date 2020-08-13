const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/r/:shareCode/:itemId/:userId', auth.cors);
  app.options('/v1/r/:shareCode/:itemId', auth.cors);

  app.post('/v1/r/:shareCode/:itemId/:userId', auth.cors, async (req, res) => {
    logger.verbose('share link handler starts');
    const { shareCode, itemId, userId } = req.params;
    const { path } = req.body;
    if (!checkShareCode(shareCode)) {
      return api.sendBadRequest(res, api.createError('Mismatch share code', 'generic.internal-error'));
    }
    if (!itemId) {
      return api.sendBadRequest(res, api.createError('Missing itemId', 'generic.internal-error'));
    }
    if (!path) {
      return api.sendBadRequest(res, api.createError('Missing path', 'generic.internal-error'));
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      await insertShare(dbClient, itemId, shareCode, userId);
      logger.debug('Share recorded');

      const body = createURL(shareCode, path);
      return api.sendResponse(res, api.createResponse(body));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to record share', 'sign-in.something-went-wrong'));
    }
  });

  app.post('/v1/r/:shareCode/:pollId', auth.cors, async (req, res) => {
    logger.verbose('share Poll handler starts');
    const { shareCode, pollId, userId } = req.params;
    const { path } = req.body;
    if (!checkShareCode(shareCode)) {
      return api.sendBadRequest(res, api.createError('Mismatch share code', 'generic.internal-error'));
    }
    if (!pollId) {
      return api.sendBadRequest(res, api.createError('Missing pollId', 'generic.internal-error'));
    }
    if (!path) {
      return api.sendBadRequest(res, api.createError('Missing path', 'generic.internal-error'));
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      await insertShare(dbClient, pollId, shareCode, userId);
      logger.debug('Share recorded');

      const body = createURL(shareCode, path);
      return api.sendResponse(res, api.createResponse(body));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to record share', 'sign-in.something-went-wrong'));
    }
  });
};

function createURL(shareCode, path) {
  const encodeURL = process.env.WEB_URL + path;
  const baseText = path.split('/')[1];
  let sendUrl = '';
  switch (shareCode) {
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
      sendUrl = `mailto: ?subject=${baseText}&body=${encodeURL}`;
      break;
    case 'whatsapp':
      sendUrl = `whatsapp://send?text=${encodeURL}`;
  }
  return sendUrl;
}

function insertShare(dbClient, itemId, shareCode, userId = null) {
  const pollShare = {
    itemId,
    userId,
    shareCode,
    date: new Date(),
  };
  return dbClient.db().collection('poll_share').insertOne(pollShare);
}

function checkShareCode(code) {
  const codeArray = ['facebook', 'twitter', 'messenger', 'whatsapp', 'email'];
  return codeArray.filter(item => item === code).length > 0;
}
