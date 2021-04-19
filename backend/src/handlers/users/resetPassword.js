const bcrypt = require('bcryptjs');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/resetPassword', auth.cors);

  app.post('/v1/resetPassword', api.authAPILimits, auth.cors, async (req, res) => {
    logger.debug('resetPassword handler starts');
    const { resetPasswordToken, password } = req.body;
    if (!resetPasswordToken) {
      return api.sendBadRequest(res, api.createError('Missing token', 'sign-in.auth-error'));
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      const user = await mongo.findUser(dbClient, { resetPasswordToken }, { projection: { auth: 1, 'bio.nickname': 1 } });
      logger.debug('User fetched');
      if (!user) {
        logger.debug('User not found');
        return api.sendErrorForbidden(res, api.createError('Token not found', 'sign-in.invalid-reset'));
      }

      const now = new Date();
      if (user.auth.reset.expires < now) {
        return api.sendErrorForbidden(res, api.createError('Invalid or expired web token', 'sign-in.expired-reset'));
      }

      const query = prepareChangePasswordQuery(password, now);
      dbClient.db().collection('users').updateOne({ _id: user._id }, query);
      logger.debug(`Password changed for user ${user._id}`);

      return api.sendResponse(res, api.createResponse({ email: user.auth.email }));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to reset the password', 'sign-in.something-went-wrong'));
    }
  });

  app.options('/v1/resetPassword/token/:token', auth.cors);

  app.get('/v1/resetPassword/token/:token', api.authAPILimits, auth.cors, async (req, res) => {
    logger.debug('get email from reset token handler starts');
    const { token } = req.params;
    if (!token) {
      return api.sendMissingParam(res, 'token');
    }

    try {
      const dbClient = await mongo.connectToDatabase();

      const user = await mongo.findUser(dbClient, { resetPasswordToken: token }, { projection: { 'auth.email': 1 } });
      logger.debug('User fetched');
      if (!user) {
        return api.sendNotFound(res, api.createError('User with this token not found', 'profile.user-not-found'));
      }
      return api.sendResponse(res, api.createResponse({ email: user.auth.email }));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to load the user from reste token', 'generic.something-went-wrong'));
    }
  });
};

const prepareChangePasswordQuery = (password, date) => {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const query = { $set: { }, $unset: { } };
  query.$set['auth.pwdHash'] = passwordHash;
  query.$set['auth.pwdTimestamp'] = date;
  query.$unset['auth.reset'] = '';
  return query;
};
