const jwt = require('jsonwebtoken');
const corsMiddleware = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const api = require('./api');

console.log(process.env.NODE_ENV);
function authenticate(required, socialUser) {
  return function (req, res, next) {
    const { authorization } = req.headers;
    if (authorization) {
      try {
        const token = authorization.split(' ')[1];
        if(socialUser){
          req.identity = jwt.verify(token, process.env.JWT_SECRET,{ audience: process.env.JWT_AUDIENCE });
        }else{
          req.identity = jwt.verify(token, process.env.JWT_SECRET);
        }
        
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

function createToken(userId, nickname, pwdTimestamp, roles, expiration = '31d', audience = '', email, socialUser) {
  const jwtData = {
    userId,
    nickname,
    pwdTimestamp,
  };
  if (roles) {
    jwtData.roles = roles;
  }
  if(email){
    jwtData.email = email;
  }
  if (socialUser) {
    jwtData.socialUser = socialUser;
  }
  return jwt.sign(jwtData, process.env.JWT_SECRET, { expiresIn: expiration, audience: audience });
}

function getIdentity(identity) {
  return { userId: identity.userId, nickname: identity.nickname };
}

function checkRole(req, role) {
  const user = req.identity;
  return user && user.roles && user.roles.includes(role);
}

const corsPerRoute = corsMiddleware({
  origin: ['http://localhost:8080', 'https://www.mezinamiridici.cz', 'http://localhost:3000'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // preflightContinue: false,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
});

const ROLE_POLL_ADMIN = 'admin:poll';

module.exports.optional = authenticate(false, false);
module.exports.required = authenticate(true, false);
module.exports.socialAuth = authenticate(true, true);
module.exports.poll_admin = withRole(ROLE_POLL_ADMIN);
module.exports.ROLE_POLL_ADMIN = ROLE_POLL_ADMIN;
module.exports.cors = corsPerRoute;
module.exports.createToken = createToken;
module.exports.createTokenFromUser = createTokenFromUser;
module.exports.getIdentity = getIdentity;
module.exports.checkRole = checkRole;
