const bcrypt = require('bcryptjs');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/resetPassword', auth.cors);

  app.post('/v1/resetPassword', api.authAPILimits, auth.cors, async (req, res) => {
    logger.verbose('resetPassword handler starts');
    const { resetPasswordToken, password } = req.body;
    if (!resetPasswordToken) {
      return api.sendBadRequest(res, api.createError('Missing token', 'sign-in.auth-error'));
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

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

      user.auth.pwdTimestamp = now;
      const token = auth.createTokenFromUser(user);
      return api.sendResponse(res, api.createResponse(token));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to reset the password', 'sign-in.something-went-wrong'));
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
