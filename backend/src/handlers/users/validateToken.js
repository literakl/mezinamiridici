const jwt = require('jsonwebtoken');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

const { JWT_SECRET } = process.env;

module.exports = (app) => {
  app.options('/v1/users/:userId/validateToken', auth.cors);

  app.post('/v1/users/:userId/validateToken', api.authAPILimits, auth.required, auth.cors, async (req, res) => {
    logger.verbose('validateToken handler starts');
    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const jwtData = req.identity;
      const user = await mongo.findUser(dbClient, { _id: jwtData.userId }, { projection: { auth: 1 } });
      logger.debug('User fetched');
      if (!user) {
        logger.debug(`User not found ${jwtData.userId}`);
        return api.sendErrorForbidden(res, api.createError('User does not exist', 'sign-in.auth-error'));
      }

      if (Date.parse(jwtData.pwdTimestamp) < Date.parse(user.auth.pwdTimestamp)) {
        return api.sendErrorForbidden(res, api.createError('Obsolete password', 'sign-in.obsolete-password'));
      }

      delete jwtData.exp;
      const token = jwt.sign(jwtData, JWT_SECRET, { expiresIn: '31d' });
      logger.debug('Token validated');
      return api.sendResponse(res, api.createResponse(token));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to verify token', 'generic.something-went-wrong'));
    }
  });
};
