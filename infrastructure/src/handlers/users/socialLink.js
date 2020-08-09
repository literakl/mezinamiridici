const axios = require('axios');
const OAuth = require('oauth');
const qs = require('qs');
const request = require('request-promise');

const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');
const CREDENTIAL = require('../../utils/social_provider_credential');

module.exports = (app) => {
  app.options('/api/auth/:provider');
  app.post('/api/auth/:provider', async (req, res) => {
    let socialProfile;
    if (req.params.provider === 'google') {
      socialProfile = await googleAuth(req, res);
    } else if (req.params.provider === 'twitter') {
      socialProfile = await twitterAuth(req, res);
    } else if (req.params.provider === 'facebook') {
      socialProfile = await facebookAuth(req, res);
    }

    if (socialProfile !== undefined && socialProfile.email !== undefined) {
      const { email, name } = socialProfile;
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');
      const user = await mongo.findUser(dbClient, { email }, { projection: { auth: 1, 'bio.nickname': 1, roles: 1 } });

      if (!user) {
        logger.debug('User not found');
        const userId = mongo.generateTimeId();
        await insertUser(dbClient, userId, email, name, req.params.provider);
        logger.debug('User created');
        const token = auth.createToken(userId, name, new Date(), null, false, '1m');
        return api.sendResponse(res, { access_token: token, token_type: 'bearer', email, name, userId, active: false });
      }

      if (!user.auth.linked || !user.auth.linked.includes(req.params.provider)) {
        await addProvider(dbClient, user, req.params.provider);
        logger.debug('User linked with new provider');
      }

      if (!user.auth.active) {
        const userId = user._id;
        const token = auth.createTokenFromUser(user);
        return api.sendResponse(res, { access_token: token, token_type: 'bearer', email, name, userId, active: false });
      }

      if (!user.auth.verified) {
        api.sendErrorForbidden(res, api.createError('User not verified', 'sign-in.auth-not-verified'));
        return res;
      }

      const token = auth.createTokenFromUser(user);
      return api.sendResponse(res, { access_token: token, token_type: 'bearer', active: true });
    // } else { // no else because of Twitter Oauth1.0 dance
    }
  });
};

async function googleAuth(req, res) {
  try {
    const requestObject = {
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
        'content-type': 'application/x-www-form-urlencoded',
      },
    };

    const googleToken = await axios(requestObject);
    if (googleToken.status === 200) {
      const googleProfileRequestObject = {
        method: 'get',
        url: CREDENTIAL.GOOGLE.PROFILE_URL,
        headers: {
          Authorization: `Bearer ${googleToken.data.access_token}`,
        },
      };

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
    logger.error('[google auth error]');
    logger.error(error);
    res.status(500).json(error);
  }
}

async function facebookAuth(req, res) {
  try {
    const requestObject = {
      method: 'post',
      url: CREDENTIAL.FACEBOOK.TOKEN_URL,
      data: {
        code: req.body.code,
        redirect_uri: req.body.redirectUri,
        client_id: CREDENTIAL.FACEBOOK.CLIENT_ID,
        client_secret: CREDENTIAL.FACEBOOK.CLIENT_SECRET,
      },
      headers: {
        'content-type': 'application/json',
      },
    };
    const facebookToken = await axios(requestObject);

    const facebookProfile = await axios.get(CREDENTIAL.FACEBOOK.PROFILE_URL, {
      params: { access_token: facebookToken.data.access_token },
    });
    const { email, name } = facebookProfile.data;
    return { email, name, provider: 'facebook' };
  } catch (error) {
    logger.error('[facebook auth error]');
    logger.error(error);
    res.status(500).json(error);
  }
}

async function twitterAuth(req, res) {
  try {
    const oauthService = new OAuth.OAuth(
      CREDENTIAL.TWITTER.REQUEST_URL,
      CREDENTIAL.TWITTER.ACCESS_URL,
      CREDENTIAL.TWITTER.CLIENT_ID,
      CREDENTIAL.TWITTER.CLIENT_SECRET,
      '1.0A', null,
      CREDENTIAL.TWITTER.ALGORITHM,
    );

    if (!req.body.oauth_token) {
      oauthService.getOAuthRequestToken({ oauth_callback: req.body.redirectUri }, (error, oauthToken, oauthTokenSecret) => {
        if (error) {
          res.status(500).json(error);
        } else {
          res.json({
            oauth_token: oauthToken,
            oauth_token_secret: oauthTokenSecret,
          });
        }
      });
    } else {
      return await getTwitterProfile(req, res, oauthService);
    }
  } catch (error) {
    logger.error('[twitter auth error]');
    logger.error(error);
    res.status(500).json(error);
  }
}

function getTwitterProfile(req, res, oauthService) {
  return new Promise((resolve, reject) => {
    oauthService.getOAuthAccessToken(req.body.oauth_token, null, req.body.oauth_verifier,
      (error, oauthAccessToken, oauthAccessTokenSecret) => {
        if (error) {
          res.status(500).json(error);
          reject(error);
        } else {
          const profileUrl = CREDENTIAL.TWITTER.PROFILE_URL;
          const profileOauth = {
            consumer_key: CREDENTIAL.TWITTER.CLIENT_ID,
            consumer_secret: CREDENTIAL.TWITTER.CLIENT_SECRET,
            token: oauthAccessToken,
            token_secret: oauthAccessTokenSecret,
          };
          request.get({
            url: profileUrl,
            qs: { include_email: true },
            oauth: profileOauth,
            json: true,
          })
            .then((profile) => {
              const { email } = profile;
              const { name } = profile;
              resolve({ email, name });
            })
            .catch((error2) => {
              reject(error2);
            });
        }
      });
  });
}

function insertUser(dbClient, id, email, nickname, provider) {
  const userDoc = {
    _id: id,
    auth: {
      email,
      verified: true,
      active: false,
      linked: [provider],
    },
    bio: {
      nickname,
    },
    driving: {},
    prefs: {
      public: true,
    },
  };

  return dbClient.db().collection('users').insertOne(userDoc);
}

async function addProvider(dbClient, user, provider) {
  const query = { $set: { } };
  if (user.auth.linked) {
    user.auth.linked.push(provider);
  } else {
    user.auth.linked = [provider];
  }
  query.$set['auth.linked'] = user.auth.linked;
  await dbClient.db().collection('users').updateOne({ _id: user._id }, query);
}
