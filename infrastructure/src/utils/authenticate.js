const jwt = require('jsonwebtoken');
const corsMiddleware = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const api = require('./api');

console.log(process.env.NODE_ENV);
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

function createTokenFromUser(user, expiration = '31d') {
  return createToken(user._id, user.bio.nickname, user.auth.pwdTimestamp, user.roles, expiration);
}

function createToken(userId, nickname, pwdTimestamp, roles, expiration = '31d') {
  const jwtData = {
    userId,
    nickname,
    pwdTimestamp,
  };
  if (roles) {
    jwtData.roles = roles;
  }
  return jwt.sign(jwtData, process.env.JWT_SECRET, { expiresIn: expiration });
}

function getIdentity(identity) {
  return { userId: identity.userId, nickname: identity.nickname };
}

function checkRole(req, role) {
  const user = req.identity;
  return user && user.roles && user.roles.includes(role);
}

const corsPerRoute = corsMiddleware({
  origin: ['http://localhost:8080', 'http://localhost:3000', 'https://www.mezinamiridici.cz'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // preflightContinue: false,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
});

const ROLE_POLL_ADMIN = 'admin:poll';

module.exports.optional = authenticate(false);
module.exports.required = authenticate(true);
module.exports.poll_admin = withRole(ROLE_POLL_ADMIN);
module.exports.ROLE_POLL_ADMIN = ROLE_POLL_ADMIN;
module.exports.cors = corsPerRoute;
module.exports.createToken = createToken;
module.exports.createTokenFromUser = createTokenFromUser;
module.exports.getIdentity = getIdentity;
module.exports.checkRole = checkRole;
