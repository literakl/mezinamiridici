const mongo = require('../../utils/mongo.js');
const auth = require('../../utils/authenticate');
const api = require('../../utils/api.js');
const { logger } = require('../../utils/logging');

async function handleSocialProviderResponse(socialProfile, res) {
  logger.verbose('socialAction starts');
  const { email, name } = socialProfile;
  const dbClient = await mongo.connectToDatabase();
  logger.debug('Mongo connected');

  const user = await mongo.findUser(dbClient, { email }, {
    projection: { auth: 1, 'bio.nickname': 1, roles: 1 },
  });

  if (!user) {
    try {
      logger.debug('User not found, store socialId');
      const socialId = mongo.generateTimeId();
      await insertSocialLogin(dbClient, socialId, email, socialProfile.provider);
      logger.debug('SocialId created');
      return api.sendCreated(res, { email, name, socialId, access_token: 'abcd' });
    } catch (error) {
      logger.error('Failed to store socialId');
      logger.error(error);
      return api.sendInternalError(res, error);
    }
  }

  if (!user.auth.linked || !user.auth.linked.includes(socialProfile.provider)) {
    try {
      await addProvider(dbClient, user, socialProfile.provider);
      logger.debug('User linked with new provider');
    } catch (error) {
      logger.error('Failed to link new social network');
      logger.error(error);
      return api.sendInternalError(res, error);
    }
  }

  if (!user.auth.verified) {
    logger.error(`User ${user._id} not verified! Potential case: registered but not activated account, then social login.`);
    return api.sendErrorForbidden(res, api.createError('User not verified', 'sign-in.auth-not-verified'));
  }

  const token = auth.createTokenFromUser(user);
  return api.sendResponse(res, {
    access_token: token,
    token_type: 'bearer',
    active: true,
  });
}

function insertSocialLogin(dbClient, id, email, provider) {
  const userDoc = {
    _id: id,
    email,
    provider,
  };

  return dbClient.db().collection('social_login').insertOne(userDoc);
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

exports.handleSocialProviderResponse = handleSocialProviderResponse;
