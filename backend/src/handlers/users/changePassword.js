const bcrypt = require('bcryptjs');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/users/:userId/password', auth.cors);

  app.patch('/v1/users/:userId/password', api.authAPILimits, auth.required, auth.cors, async (req, res) => {
    logger.verbose('changePassword handler starts');
    const { userId } = req.params;
    if (req.identity.userId !== userId) {
      logger.debug(`JWT token = ${req.identity.userId} but URL userId = ${userId}!`);
      return api.sendErrorForbidden(res, api.createError('JWT mismatch', 'sign-in.auth-error'));
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const { currentPassword, newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        const result = { success: false };
        api.addValidationError(result, 'password', 'Missing or short password', 'sign-up.password-required');
        return api.sendErrorForbidden(res, result);
      }

      const user = await mongo.findUser(dbClient, { userId }, { projection: { auth: 1, 'bio.nickname': 1 } });
      if (!user) {
        return api.sendErrorForbidden(res, api.createError('User not found', 'sign-in.auth-error'));
      }
      logger.debug('User fetched');

      if (!bcrypt.compareSync(currentPassword, user.auth.pwdHash)) {
        logger.debug(`Password mismatch for user ${user._id}`);
        return api.sendErrorForbidden(res, api.createError('Bad credentials', 'sign-in.auth-error'));
      }

      const date = new Date();
      const query = prepareChangePasswordQuery(newPassword, date);
      await dbClient.db().collection('users').updateOne({ _id: userId }, query);
      logger.debug('User updated');

      user.auth.pwdTimestamp = date;
      const token = auth.createTokenFromUser(user);
      return api.sendResponse(res, api.createResponse(token));
    } catch (err) {
      // eslint-disable-next-line no-console
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('failed to update the user', 'sign-up.something-went-wrong'));
    }
  });
};

const prepareChangePasswordQuery = (password, date) => {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const query = { $set: { } };
  query.$set['auth.pwdHash'] = passwordHash;
  query.$set['auth.pwdTimestamp'] = date;
  return query;
};
