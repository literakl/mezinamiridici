const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');
const mailService = require('../../utils/mailService');

module.exports = (app) => {
  app.options('/v1/forgotPassword', auth.cors);

  app.post('/v1/forgotPassword', auth.cors, async (req, res) => {
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
        let sendResult = '';
        let sendError = '';
        let info = await sendVerificationEmail(email, resetToken, function(error, result){
          logger.debug(' * * * * * email sent ? ');
          logger.debug(result);
          sendResult = result;
          
          logger.debug(error);
          sendError = error;
        });
        logger.debug(info);
        if(info && sendResult !== null){
          logger.debug(' Email sent ');
        }else{
          return api.sendInternalError(res, api.createError(sendError, 'sign-in.something-went-wrong'));
        }
  
      } catch (err) {
        return api.sendInternalError(res, api.createError('Failed to reset the password', 'sign-in.something-went-wrong'));
      }
      // sendVerificationEmail(email, resetToken);
      // logger.debug('Email sent');
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

const sendVerificationEmail = async (email, token, fn) => {
  const body = {
    verificationLink : `https://www.mezinamiridici.cz/nastaveni-hesla/${token}`,
    subject : 'Obnova hesla',
    email,
  }
  try{
    let info = await mailService.sendEmailService('forgotPassword', body, fn);
    logger.info(info);
    return info;
  }catch(error){
    logger.info('---->',error);
    return error;
  }


};
