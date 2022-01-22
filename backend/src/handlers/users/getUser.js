const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/users/:userId', auth.cors);
  app.options('/v1/check/email', auth.cors);
  app.options('/v1/check/nickname', auth.cors);
  app.options('/bff/users', auth.cors);
  app.options('/bff/users/:userId/info', auth.cors);

  app.get('/v1/users/:userId', auth.optional, async (req, res) => {
    logger.debug('getUser handler starts');
    const { userId } = req.params;
    if (!userId) {
      return api.sendMissingParam(res, 'userId');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      const user = await mongo.findUser(dbClient, { userId }, { projection: { 'prefs.email': 0, consent: 0 } });
      logger.debug('User fetched');
      if (!user) {
        return api.sendNotFound(res, api.createError('User not found', 'profile.user-not-found'));
      }

      if ((!req.identity || req.identity.userId !== userId) && !user.prefs.public) {
        user.bio = { nickname: user.bio.nickname, registered: user.bio.registered };
        user.prefs = { public: user.prefs.public };
        user.driving = {};
      }

      if (req.identity && req.identity.userId === userId) {
        // noinspection JSObjectNullOrUndefined
        user.auth = { email: user.auth.email };
      } else {
        user.auth = undefined;
      }

      return api.sendResponse(res, api.createResponse(user));
      // return api.sendResponse(callback, api.createResponse(user), "public, max-age=600");
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to load the user', 'generic.something-went-wrong'));
    }
  });

  app.post('/v1/check/email', auth.cors, async (req, res) => {
    logger.debug('User email check handler starts');
    const { email } = req.body;

    try {
      const dbClient = await mongo.connectToDatabase();
      const user = await mongo.findUser(dbClient, { email }, { projection: { auth: 1, 'bio.nickname': 1, roles: 1 } });
      logger.debug('User fetched');
      const data = { conflict: false };
      if (user) {
        logger.debug('User found');
        data.conflict = true;
      }
      return api.sendResponse(res, api.createResponse(data));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to check the user', 'sign-in.something-went-wrong'));
    }
  });

  app.post('/v1/check/nickname', auth.cors, async (req, res) => {
    logger.debug('User nickname check handler starts');
    const { nickname } = req.body;

    try {
      const dbClient = await mongo.connectToDatabase();
      const user = await mongo.findUser(dbClient, { nickname }, { projection: { auth: 1, 'bio.nickname': 1, roles: 1 } });
      logger.debug('User fetched');
      const data = { conflict: false };
      if (user) {
        logger.debug(`User ${nickname} found`);
        data.conflict = true;
      }
      return api.sendResponse(res, api.createResponse(data));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to check the user', 'sign-in.something-went-wrong'));
    }
  });

  app.get('/bff/users/:userId/info', auth.cors, async (req, res) => {
    logger.debug('Get user info check handler starts');
    const { userId } = req.params;
    if (!userId) {
      return api.sendMissingParam(res, 'userId');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      const user = await mongo.findUser(dbClient, { userId }, { projection: { 'bio.nickname': 1, 'bio.registered': 1, honors: 1 } });
      logger.debug('User fetched');

      if (!user) {
        return api.sendNotFound(res, api.createError('User not found', 'profile.user-not-found'));
      }
      return api.sendResponse(res, api.createResponse(user));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get the user', 'sign-in.something-went-wrong'));
    }
  });

  app.get('/bff/users/', auth.optional, async (req, res) => {
    logger.debug('Get users infos handler starts');
    const listParams = api.parseListParams(req, 'registered', -1, 20, 50);
    const query = { };
    if (listParams.lastResult) {
      query[listParams.lastResult.key] = listParams.lastResult.value;
    }
    const pipeline = [
      { $match: query },
      { $sort: listParams.order },
      { $project: { 'bio.nickname': 1, 'bio.registered': 1, honors: 1 } },
      { $limit: listParams.pageSize },
    ];

    if (auth.checkRole(req, auth.ROLE_EDITOR_IN_CHIEF)) {
      const { role } = req.query;
      if (role) {
        query['roles'] = mongo.sanitize(role);
      }
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      const users = await dbClient.db().collection('users').aggregate(pipeline, { allowDiskUse: true }).toArray();
      logger.debug('Users fetched');

      return api.sendResponse(res, api.createResponse(users));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get the user', 'sign-in.something-went-wrong'));
    }
  });
};
