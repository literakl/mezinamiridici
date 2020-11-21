const sanitizeHtml = require('sanitize-html');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.patch('/v1/users/:userId', auth.required, auth.cors, async (req, res) => {
    logger.verbose('updateUser handler starts');
    const { userId } = req.params;
    if (req.identity.userId !== userId) {
      logger.error(`JWT token = ${req.identity.userId} but URL userId = ${userId}!`);
      return api.sendErrorForbidden(res, api.createError('JWT mismatch', 'sign-in.auth-error'));
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const query = prepareUpdateProfileQuery(req);
      await dbClient.db().collection('users').updateOne({ _id: userId }, query);
      logger.debug('User updated');
      return api.sendResponse(res, api.createResponse());
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('failed update the user', 'sign-up.something-went-wrong'));
    }
  });
};

function prepareUpdateProfileQuery(req) {
  const {
    drivingSince, vehicles, sex, born, region, education, publicProfile, urls,
  } = req.body;
  const setters = {}, unsetters = {};
  if (sex) {
    setters['bio.sex'] = sex;
  } else {
    unsetters['bio.sex'] = '';
  }
  if (born) {
    setters['bio.born'] = born;
  } else {
    unsetters['bio.born'] = '';
  }
  if (region) {
    setters['bio.region'] = region;
  } else {
    unsetters['bio.region'] = '';
  }
  if (education) {
    setters['bio.edu'] = education;
  } else {
    unsetters['bio.edu'] = '';
  }
  if (drivingSince) {
    setters['driving.since'] = drivingSince;
  } else {
    unsetters['driving.since'] = '';
  }
  if (vehicles) {
    setters['driving.vehicles'] = vehicles;
  } else {
    unsetters['driving.vehicles'] = '';
  }
  if (publicProfile === true || publicProfile === false) {
    setters['prefs.public'] = publicProfile;
  }
  const query = { };
  if (Object.keys(setters).length !== 0) {
    query.$set = setters;
  }
  if (Object.keys(unsetters).length !== 0) {
    query.$unset = unsetters;
  }
  if (urls) {
    setters['bio.urls'] = urls.filter((x) => {
      if (!x || x === '') return false;
      const source = `<a href="${x}">XSS</a>`;
      const sanitized = sanitizeHtml(source, api.sanitizeConfigure());
      if (source !== sanitized) {
        logger.error(`XSS detected ${x}`);
        throw new Error('XSS detected');
      }
      return true;
    });
  } else {
    unsetters['bio.urls'] = [];
  }
  return query;
}
