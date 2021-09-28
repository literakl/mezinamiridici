const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');
const { bruteForceDelay } = require('./authorizeUser');
const { sendVerificationEmail } = require('./createUser');

module.exports = (app) => {
  // anonymous URLs, not RESTful
  app.options('/v1/verify/resend', auth.cors);
  app.options('/v1/verify/:token', auth.cors);

  app.post('/v1/verify/resend', api.resendAPILimits, auth.cors, async (req, res) => {
    logger.debug('Resend activation token handler starts');
    try {
      const { email } = req.body;
      if (!email) {
        return api.sendMissingParam(res, 'email');
      }

      const dbClient = await mongo.connectToDatabase();
      const user = await mongo.findUser(dbClient, { email }, { projection: { auth: 1 } });
      logger.debug('User fetched');

      if (!user) {
        setTimeout(() => api.sendErrorForbidden(res, api.createError('User not found', 'sign-up.activation-user-not-found-error')), bruteForceDelay);
        return res;
      }

      if (user.auth.verified === true) {
        setTimeout(() => api.sendErrorForbidden(res, api.createError('User already verified', 'sign-up.already-verified-error')), bruteForceDelay);
        return res;
      }

      await sendVerificationEmail(email, user.auth.verifyToken);
      logger.debug('Activation email sent');

      return api.sendResponse(res, api.createResponse());
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to resend token', 'sign-up.something-went-wrong'));
    }
  });

  app.post('/v1/verify/:token', api.authAPILimits, auth.cors, async (req, res) => {
    logger.debug('verifyUser handler starts');
    const { token } = req.params;

    try {
      const dbClient = await mongo.connectToDatabase();
      const user = await mongo.findUser(dbClient, { token }, { projection: { auth: 1 } });
      logger.debug('User fetched');
      if (!user) {
        return api.sendErrorForbidden(res, api.createError('user has already been verified', 'sign-up.already-verified-error'));
      }

      await verifyUser(dbClient, user);
      logger.debug('User verified');
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

function verifyUser(dbClient, user) {
  if (user.auth.verified) {
    throw api.createError('user has already been verified', 'sign-up.already-verified');
  }

  const query = { $set: { }, $unset: { } };
  query.$set['auth.verified'] = true;
  query.$set['auth.active'] = true;
  query.$unset['auth.verifyToken'] = '';
  return dbClient.db().collection('users').updateOne({ _id: user._id }, query);
}
