const bcrypt = require('bcryptjs');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');
const mailService = require('../../utils/mailService');

module.exports = (app) => {
  app.options('/v1/users', auth.cors);

  app.post('/v1/users', auth.cors, async (req, res) => {
    logger.verbose('createUser handler starts');
    const {
      email, password, nickname, termsAndConditions, dataProcessing, emails,
    } = req.body;
    const result = validateParameters(email, password, nickname, termsAndConditions, dataProcessing);
    if (!result.success) {
      logger.debug('validation failed', result);
      return api.sendBadRequest(res, result);
    }

    const verificationToken = mongo.generateId(8);
    const userId = mongo.generateTimeId();
    const dbClient = await mongo.connectToDatabase();
    logger.debug('Mongo connected');

    try {
      await insertUser(dbClient, userId, email, password, nickname, emails, verificationToken);
      logger.debug('User created');
    } catch (err) {
      logger.error('Request failed', err);
      if (err.code === 11000) {
        if (err.keyValue) {
          if (err.keyValue['auth.email']) {
            api.addValidationError(result, 'email', 'email is already registered', 'sign-up.email-exists');
          }
          if (err.keyValue['bio.nickname']) {
            api.addValidationError(result, 'nickname', 'nickname has been already taken', 'sign-up.nickname-exists');
          }
        } else {
          const keyValue = err.errmsg.split('index:')[1].split('dup key')[0].split('_')[0].trim();
          if (keyValue === 'auth.email') {
            api.addValidationError(result, 'email', 'email is already registered', 'sign-up.email-exists');
          }
          if (keyValue === 'bio.nickname') {
            api.addValidationError(result, 'nickname', 'nickname has been already taken', 'sign-up.nickname-exists');
          }
        }
        return api.sendConflict(res, result);
      }
      return api.sendInternalError(res, api.createError('failed to create new user', 'sign-up.something-went-wrong'));
    }

    try {
      await sendVerificationEmail(email, verificationToken);
      logger.debug('Email sent');
    } catch (err) {
      console.error('Sending email failed', err);
      return api.sendInternalError(res, api.createError('Failed to send email', 'sign-up.something-went-wrong'));
    }

    const token = auth.createToken(userId, nickname, new Date(), null, false, '1m');
    return api.sendCreated(res, api.createResponse(token));
  });
};

function insertUser(dbClient, id, email, password, nickname, emails, verificationToken) {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const now = new Date();
  const userDoc = {
    _id: id,
    auth: {
      email,
      pwdHash: passwordHash,
      pwdTimestamp: now,
      active: false,
      verified: false,
      verifyToken: verificationToken,
    },
    bio: {
      nickname,
    },
    driving: {},
    prefs: {
      public: true,
    },
    consent: {
      terms: now,
      data: now,
    },
  };
  if (emails) {
    userDoc.consent.email = now;
    userDoc.prefs.email = { newsletter: true, summary: 'daily' };
  }

  return dbClient.db().collection('users').insertOne(userDoc);
}

const sendVerificationEmail = async (email, token) => {
  const options = {
    to: email,
  };
  const context = {
    verificationLink: `${process.env.WEB_URL}/overeni-uzivatele/${token}`,
  };
  return mailService.sendEmail('confirm_email.json', options, context);
};

const validateParameters = (email, password, nickname, termsAndConditions, dataProcessing) => {
  const result = { success: true };
  if (!termsAndConditions) {
    result.success = false;
    api.addValidationError(result, undefined, 'Missing consent', 'sign-up.consent-missing');
  }
  if (!dataProcessing) {
    result.success = false;
    api.addValidationError(result, undefined, 'Missing consent', 'sign-up.consent-missing');
  }
  if (!email || email.indexOf('@') === -1 || email.indexOf('.') === -1) {
    result.success = false;
    api.addValidationError(result, 'email', 'Missing or invalid email', 'sign-up.email-required');
  }
  if (!password || password.length < 6) {
    result.success = false;
    api.addValidationError(result, 'password', 'Missing or short password', 'sign-up.password-required');
  }
  if (!nickname || nickname.length < 3) {
    result.success = false;
    api.addValidationError(result, 'nickname', 'Missing or short nickname', 'sign-up.nickname-required');
  }
  return result;
};
