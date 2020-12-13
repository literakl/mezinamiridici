const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');
const mailService = require('../../utils/mailService');
require('../../utils/path_env');

module.exports = (app) => {
  app.options('/v1/forgotPassword', auth.cors);

  app.post('/v1/forgotPassword', api.authAPILimits, auth.cors, async (req, res) => {
    logger.verbose('forgotPassword handler starts');
    const { email } = req.body;

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const user = await mongo.findUser(dbClient, { email }, { projection: { auth: 1 } });
      if (!user) {
        logger.error(`User not found ${email}`);
        return api.sendErrorForbidden(res, api.createError('User not found', 'sign-in.auth-error'));
      }

      const resetToken = mongo.generateId(16);
      const expiration = new Date(Date.now() + 6 * 60 * 60 * 1000); // six hours
      const query = prepareSetTokenQuery(resetToken, expiration);
      dbClient.db().collection('users').updateOne({ _id: user._id }, query);
      logger.debug('Token updated in User');

      try {
        await sendPasswordResetEmail(email, resetToken);
        logger.debug('Email sent');
      } catch (err) {
        console.error('Sending email failed', err);
        return api.sendInternalError(res, api.createError('Failed to send email', 'sign-in.something-went-wrong'));
      }
      return api.sendResponse(res, api.createResponse({}));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to reset the password', 'sign-in.something-went-wrong'));
    }
  });
};

const prepareSetTokenQuery = (token, date) => {
  const query = { $set: { } };
  query.$set['auth.reset.token'] = token;
  query.$set['auth.reset.expires'] = date;
  return query;
};

const sendPasswordResetEmail = async (email, token) => {
  const options = {
    to: email,
  };
  const context = {
    WEB_URL: process.env.WEB_URL,
    verificationLink: `${process.env.WEB_URL}/p/nastaveni-hesla/${token}`,
  };
  return mailService.sendEmail('reset_password.json', options, context);
};
