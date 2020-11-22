const bcrypt = require('bcryptjs');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

const bruteForceDelay = 1000;

module.exports = (app) => {
  app.options('/v1/authorizeUser', auth.cors);

  app.post('/v1/authorizeUser', api.authAPILimits, auth.cors, async (req, res) => {
    logger.verbose('authorizeUser handler starts');
    const { email, password } = req.body;
    const result = validateParameters(email, password);
    if (!result.success) {
      return api.sendBadRequest(res, result);
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const user = await mongo.findUser(dbClient, { email }, { projection: { auth: 1, 'bio.nickname': 1, roles: 1 } });
      logger.debug('User fetched');
      if (!user) {
        logger.debug(`User not found ${email}`);
        setTimeout(() => api.sendErrorForbidden(res, api.createError('Bad credentials', 'sign-in.auth-error')), bruteForceDelay);
        return res;
      }

      if (!user.auth.verified) {
        setTimeout(() => api.sendErrorForbidden(res, api.createError('User not verified', 'sign-in.auth-not-verified')), bruteForceDelay);
        return res;
      }

      // following part takes more than 1 second with 128 MB RAM on AWS Lambda!
      if (bcrypt.compareSync(password, user.auth.pwdHash)) {
        logger.debug('Password verified');
        const token = auth.createTokenFromUser(user);
        return api.sendResponse(res, api.createResponse(token));
      }

      logger.verbose(`Password mismatch for user ${user._id}`);
      setTimeout(() => api.sendErrorForbidden(res, api.createError('Bad credentials', 'sign-in.auth-error')), bruteForceDelay);
      return res;
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to authorize the user', 'sign-in.something-went-wrong'));
    }
  });
};

const validateParameters = (email, password) => {
  const result = { success: true };
  if (!email) {
    result.success = false;
    api.addValidationError(result, 1000, 'email', 'Missing email');
  } else if (email.indexOf('@') === -1 || email.indexOf('.') === -1) {
    result.success = false;
    api.addValidationError(result, 1001, 'email', 'Invalid email');
  }
  if (!password) {
    result.success = false;
    api.addValidationError(result, 1000, 'password', 'Missing password');
  }
  return result;
};
