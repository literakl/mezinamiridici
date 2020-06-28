const axios = require('axios');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

module.exports = (app) => {
  app.options('/auth/:provider');
  app.post('/auth/:provider', async (req, res) => {
    const response = await axios.post('https://graph.facebook.com/v2.4/oauth/access_token', {
      client_id: '860316561127732',
      client_secret: '277f8e34f5d69d52bdc427b5abb420d6',
      code: req.body.code,
      redirect_uri: req.body.redirectUri,
    }, { 'Content-Type': 'application/json' });
    const responseJson = response.data;
    const profile = await axios.get('https://graph.facebook.com/v2.5/me?fields=email,name', {
      params: { access_token: responseJson.access_token },
    });
    const { email, name } = profile.data;
    if (!email) {
      console.log('[no email]');
      // return error
    }
    const dbClient = await mongo.connectToDatabase();
    logger.debug('Mongo connected');

    const user = await mongo.findUser(dbClient, { email }, { projection: { auth: 1, 'bio.nickname': 1, roles: 1 } });
    if (!user) {
      logger.debug(`User not found ${email}`);
      const userId = mongo.generateTimeId();
      await insertUser(dbClient, userId, email, name);
      logger.debug('User created');
      const token = auth.createToken(userId, name, new Date(), null, '1m');
      return api.sendResponse(res, { access_token: token, token_type: 'bearer' });
    }
    if (!user.auth.verified) {
      setTimeout(() => api.sendErrorForbidden(res, api.createError('User not verified', 'sign-in.auth-not-verified')), bruteForceDelay);
      return res;
    }
    const token = auth.createTokenFromUser(user);
    return api.sendResponse(res, { access_token: token, token_type: 'bearer' });
  });
};

function insertUser(dbClient, id, email, nickname) {
  const now = new Date();
  const userDoc = {
    _id: id,
    auth: {
      email,
      pwdTimestamp: now,
      verified: true,
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

  return dbClient.db().collection('users').insertOne(userDoc);
}
