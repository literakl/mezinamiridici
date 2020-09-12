const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/reject/:token', auth.cors);

  app.post('/v1/reject/:token', auth.cors, async (req, res) => {
    logger.verbose('Reject notification handler starts');
    const { token, type } = req.params;

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const user = await findUser(dbClient, token, type, { projection: { prefs: 1, consent: 1 } });
      logger.debug('User fetched');
      if (!user) {
        return api.sendErrorForbidden(res, api.createError('user has already been rejected', 'sign-up.already-verified'));
      }

      await rejectNotification(dbClient, user, type);
      logger.debug('Reject success');
      return api.sendResponse(res, api.createResponse());
    } catch (err) {
      logger.error('Request failed', err);
      if (err.success === false) {
        return api.sendErrorForbidden(res, err);
      }
      return api.sendInternalError(res, api.createError('failed to verify new user', 'sign-up.something-went-wrong'));
    }
  });
};

function findUser(dbClient, token, type, projection) {
  const query = (type === 'poll') ? { 'prefs.newPollRejectToken': token } : { 'prefs.reactionRejectToken': token };
  
  return dbClient.db()
    .collection('users')
    .findOne(query, projection)
    .then(doc => doc);
}

function rejectNotification(dbClient, user, rejectType) {
  if (rejectType === 'poll' && user.prefs.email.poll === false) {
    throw api.createError('poll notification already been rejected', 'sign-up.already-verified');
  }
  if (rejectType === 'reaction' && user.prefs.email.reaction === false) {
    throw api.createError('reaction notification already been rejected', 'sign-up.already-verified');
  }

  const query = { $set: { }, $unset: { } };
  if (rejectType === 'poll') {
    query.$set['prefs.email.poll'] = false;
    query.$unset['prefs.newPollRejectToken'] = '';
  } else {
    query.$set['prefs.email.reaction'] = false;
    query.$unset['prefs.reactionRejectToken'] = '';
  }
  return dbClient.db().collection('users').updateOne({ _id: user._id }, query);
}
