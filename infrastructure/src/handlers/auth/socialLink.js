const axios = require('axios');
const OAuth = require('oauth');
const timestamp = require('unix-timestamp');
const oauthSignature = require('oauth-signature');
const qs = require('qs');
var request = require('request-promise');
const util = require('util');


const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');
const CREDENTIAL = require('../../utils/social_provider_credential');

const bruteForceDelay = 1000;
module.exports = (app) => {
  app.options('/api/auth/:provider');
  app.post('/api/auth/:provider', async (req, res) => {
    if (req.params.provider === 'google') {
      var socialProfile = await googleAuth(req, res);
    } else if (req.params.provider === 'twitter') {
      var socialProfile = await twitterAuth(req, res);
    } else if (req.params.provider === 'facebook') {
      var socialProfile = await facebookAuth(req, res);
    }
    if (socialProfile !== undefined && socialProfile.email !== undefined) {
      const { email, name } = socialProfile;
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');
      const user = await mongo.findUser(dbClient, { email }, { projection: { auth: 1, 'bio.nickname': 1, roles: 1 } });

      if (!user) {
        logger.debug(`User not found ${email}`);
        const userId = mongo.generateTimeId();
        await insertUser(dbClient, userId, email, name);
        logger.debug('User created');
        const token = auth.createToken(userId, name, new Date(), null, '1m');
        return api.sendResponse(res, { access_token: token, token_type: 'bearer', email, name, userId, active: false });
      }
      if (!user.auth.active) {
        console.log(user);
        const userId = user._id;
        const token = auth.createTokenFromUser(user);
        return api.sendResponse(res, { access_token: token, token_type: 'bearer', email, name, userId, active: user.auth.active });
      }
      if (!user.auth.verified) {
        setTimeout(() => api.sendErrorForbidden(res, api.createError('User not verified', 'sign-in.auth-not-verified')), bruteForceDelay);
        return res;
      }
      const token = auth.createTokenFromUser(user);
      return api.sendResponse(res, { access_token: token, token_type: 'bearer', active: user.auth.active });
    }
    //  else {
    //   res.status(401);
    // }
  });
};

async function googleAuth(req, res) {
  try {
    const googleAuthRequestObject = {
      method: 'post',
      url: CREDENTIAL.GOOGLE.TOKEN_URL,
      data: qs.stringify({
        code: req.body.code,
        redirect_uri: req.body.redirectUri,
        client_id: CREDENTIAL.GOOGLE.CLIENT_ID,
        client_secret: CREDENTIAL.GOOGLE.CLIENT_SECRET,
        grant_type: CREDENTIAL.GOOGLE.GRANT_TYPE,
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    }
    const googleToken = await axios(googleAuthRequestObject);
    console.log(googleToken.data)
    if (googleToken.status === 200) {
      const googleProfileRequestObject = {
        method: 'get',
        url: CREDENTIAL.GOOGLE.PROFILE_URL,
        headers: {
          'Authorization': 'Bearer ' + googleToken.data.access_token
        }
      }
      const googleProfile = await axios(googleProfileRequestObject);
      if (googleProfile.status === 200) {
        console.log(googleProfile.data);
        const email = googleProfile.data.emailAddresses[0].value;
        const name = googleProfile.data.names[0].displayName;
        return { email, name, provider: 'google' };
      } else {
        res.status(500);
      }
    } else {
      res.status(500);
    }
  } catch (error) {
    console.log('[google auth error]');
    console.log(error);
    res.status(500).json(err || e);
  }
}

async function facebookAuth(req, res) {
  try {
    const facebookToken = await axios.post(CREDENTIAL.FACEBOOK.TOKEN_URL, {
      client_id: CREDENTIAL.FACEBOOK.CLIENT_ID,
      client_secret: CREDENTIAL.FACEBOOK.CLIENT_SECRET,
      code: req.body.code,
      redirect_uri: req.body.redirectUri,
    }, { 'Content-Type': 'application/json' });
    const facebookProfile = await axios.get(CREDENTIAL.FACEBOOK.PROFILE_URL, {
      params: { access_token: facebookToken.data.access_token },
    });
    const { email, name } = facebookProfile.data;
    return { email, name, provider: 'facebook' };
  } catch (error) {
    console.log('[facebook auth error]');
    console.log(error);
    res.status(500).json(err || e);
  }
}

function getTwitterProfile(req) {
  return new Promise((resolve, reject) => {
    oauthService.getOAuthAccessToken(req.body.oauth_token, null, req.body.oauth_verifier,
      function (error, oauthAccessToken, oauthAccessTokenSecret, results) {
        if (error) {
          res.status(500).json(error);
          reject(error);
        } else {
          var profileUrl = CREDENTIAL.TWITTER.PROFILE_URL;
          var profileOauth = {
            consumer_key: CREDENTIAL.TWITTER.CLIENT_ID,
            consumer_secret: CREDENTIAL.TWITTER.CLIENT_SECRET,
            token: oauthAccessToken,
            token_secret: oauthAccessTokenSecret,
          };
          request.get({
            url: profileUrl,
            qs: { include_email: true },
            oauth: profileOauth,
            json: true
          })
            .then((profile) => {
              console.log(profile);
              const email = profile.email;
              const name = profile.name;
              resolve({ email, name });
            })
            .catch((error) => {
              reject(error);
            });
        }
      })
  });
}
async function twitterAuth(req, res) {
  oauthService = new OAuth.OAuth(
    CREDENTIAL.TWITTER.REQUEST_URL,
    CREDENTIAL.TWITTER.ACCESS_URL,
    CREDENTIAL.TWITTER.CLIENT_ID,
    CREDENTIAL.TWITTER.CLIENT_SECRET,
    '1.0A', null, CREDENTIAL.TWITTER.ALGORITHM);
  try {
    if (!req.body.oauth_token) {
      oauthService.getOAuthRequestToken({ oauth_callback: req.body.redirectUri }, function (error, oauthToken, oauthTokenSecret, results) {
        if (error) {
          res.status(500).json(error)
        } else {
          res.json({
            oauth_token: oauthToken,
            oauth_token_secret: oauthTokenSecret
          })
        }
      })
    } else {
      const socialProfile = await getTwitterProfile(req);
      console.log(socialProfile);
      return socialProfile;
    }
  } catch (error) {
    console.log('[twitter auth error]');
    console.log(error);
    res.status(500).json(err || e);
  }
}

function insertUser(dbClient, id, email, nickname) {
  const now = new Date();
  const userDoc = {
    _id: id,
    auth: {
      email,
      pwdTimestamp: now,
      verified: true,
      active: false,
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
