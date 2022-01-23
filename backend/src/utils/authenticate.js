const jwt = require('jsonwebtoken');
const corsMiddleware = require('cors');

const { logger } = require('../utils/logging');

const api = require('./api');
require('./path_env');

let CORS_ORIGINS = ['http://localhost:8080', 'http://localhost:3000'];
try {
  const envOrigins = process.env.CORS_ORIGINS;
  if (envOrigins) {
    CORS_ORIGINS = JSON.parse(envOrigins);
  }
} catch (e) {
  logger.error(`Failed to parse CORS_ORIGINS ${e}`);
}

function authenticate(required) {
  return function (req, res, next) {
    const { authorization } = req.headers;
    if (authorization) {
      try {
        const token = authorization.split(' ')[1];
        req.identity = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        api.sendInternalError(res, api.createError('JWT parsing error'));
        res.end();
        return;
      }
    }
    if (required && !req.identity) {
      api.sendNotAuthorized(res, api.createError('Authentication required'));
      res.end();
      return;
    }
    next();
  };
}

function withRole(role) {
  return function (req, res, next) {
    if (!req.identity.roles || !req.identity.roles.includes(role)) {
      api.sendErrorForbidden(res, api.createError('Access denied'));
      res.end();
      return;
    }
    next();
  };
}

function withAnyRole(roles) {
  return function (req, res, next) {
    if (!req.identity.roles || !req.identity.roles.some(r => roles.includes(r))) {
      api.sendErrorForbidden(res, api.createError('Access denied'));
      res.end();
      return;
    }
    next();
  };
}

function createTokenFromUser(user, expiration = '31d') {
  return createToken(user._id, user.bio.nickname, user.auth.pwdTimestamp, user.roles, user.auth.active, expiration);
}

function createToken(userId, nickname, pwdTimestamp, roles, active, expiration = '31d') {
  const jwtData = {
    userId,
    nickname,
    pwdTimestamp,
    active,
  };
  if (roles) {
    jwtData.roles = roles;
  }
  return jwt.sign(jwtData, process.env.JWT_SECRET, { expiresIn: expiration });
}

function getIdentity(identity) {
  return { userId: identity.userId, nickname: identity.nickname };
}

function checkRole(req, ...roles) {
  const user = req.identity;
  if (!user || !user.roles) {
    return false;
  }
  return roles.some(role => user.roles.includes(role));
}

const corsPerRoute = corsMiddleware({
  origin: CORS_ORIGINS,
  allowedHeaders: ['Content-Type', 'Authorization'],
  // preflightContinue: false,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
});

const ROLE_BLOG_ADMIN = 'admin:blog';
const ROLE_PAGE_ADMIN = 'admin:pages';
const ROLE_EDITOR_IN_CHIEF = 'admin:editor';
const ROLE_POLL_ADMIN = 'admin:poll';
const ROLE_STAFFER = 'user:staffer';

/* authentication is optional */
module.exports.optional = authenticate(false);
/* authentication is mandatory */
module.exports.required = authenticate(true);

module.exports.blog_admin = withRole(ROLE_BLOG_ADMIN);
module.exports.page_admin = withRole(ROLE_PAGE_ADMIN);
module.exports.editor_in_chief = withRole(ROLE_EDITOR_IN_CHIEF);
module.exports.editorial_staff = withAnyRole([ROLE_STAFFER, ROLE_EDITOR_IN_CHIEF]);
module.exports.poll_admin = withRole(ROLE_POLL_ADMIN);
module.exports.staffer = withRole(ROLE_STAFFER);

/** manage polls */
module.exports.ROLE_POLL_ADMIN = ROLE_POLL_ADMIN;
/** manage user provided content */
module.exports.ROLE_BLOG_ADMIN = ROLE_BLOG_ADMIN;
/** manages articles */
module.exports.ROLE_EDITOR_IN_CHIEF = ROLE_EDITOR_IN_CHIEF;
/** manage site pages like Help */
module.exports.ROLE_PAGE_ADMIN = ROLE_PAGE_ADMIN;
/** writes articles */
module.exports.ROLE_STAFFER = ROLE_STAFFER;

module.exports.cors = corsPerRoute;
module.exports.createToken = createToken;
module.exports.createTokenFromUser = createTokenFromUser;
module.exports.getIdentity = getIdentity;
module.exports.checkRole = checkRole;
