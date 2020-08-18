const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

module.exports = (app) => {
  app.options('/api/v1/user/:userId/activate', auth.cors);

  app.patch('/api/v1/user/:userId/activate', auth.required, auth.cors, async (req, res) => {
    logger.verbose('activateUser handler starts');
    const { userId } = req.params;
    const { nickname, termsAndConditions, dataProcessing } = req.body;
    if (req.identity.userId !== userId) {
      logger.error(`JWT token = ${req.identity.userId} but URL userId = ${userId}!`);
      return api.sendErrorForbidden(res, api.createError('JWT mismatch', 'sign-in.auth-error'));
    }

    const result = validateParameters(nickname, termsAndConditions, dataProcessing);
    if (!result.success) {
      logger.debug('validation failed', result);
      return api.sendBadRequest(res, result);
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');
      const query = prepareUpdateProfileQuery(req);
      await dbClient.db().collection('users').updateOne({ _id: userId }, query);
      logger.debug('User updated');
      return api.sendResponse(res, api.createResponse());
    } catch (err) {
      logger.error('Request failed', err);
      if (err.code === 11000) {
        return api.sendResponse(res, api.createError('nickname already present', 'confirm.nickname-already-present'));
      } else {
        return api.sendInternalError(res, api.createError('failed update the user', 'sign-up.something-went-wrong'));
      }
    }
  });
};

function prepareUpdateProfileQuery(req) {
  const { emails, nickname } = req.body;
  const query = { $set: { }, $unset: { } };
  const now = new Date();

  query.$set['consent.terms'] = now;
  query.$set['consent.data'] = now;
  query.$set['auth.active'] = true;
  query.$set['bio.nickname'] = nickname;
  if (emails) {
    query.$set['consent.email'] = now;
  }
  return query;
}

const validateParameters = (nickname, termsAndConditions, dataProcessing) => {
  const result = { success: true };
  if (!termsAndConditions) {
    result.success = false;
    api.addValidationError(result, undefined, 'Missing consent', 'sign-up.consent-missing');
  }
  if (!dataProcessing) {
    result.success = false;
    api.addValidationError(result, undefined, 'Missing consent', 'sign-up.consent-missing');
  }
  if (!nickname || nickname.length < 3) {
    result.success = false;
    api.addValidationError(result, 'nickname', 'Missing or short nickname', 'sign-up.nickname-required');
  }
  return result;
};
