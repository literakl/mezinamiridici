const jwt = require('jsonwebtoken');
const corsMiddleware = require('cors');
const dotenv = require('dotenv');
dotenv.config();

function authenticate(required) {
    return function(req, res, next) {
        const { authorization } = req.headers;
        if (authorization) {
            try {
                const token = authorization.split(" ")[1];
                req.identity = jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                res.status(500);
                res.end('JWT parsing error');
                return;
            }
        }
        if (required && !req.identity) {
            res.status(401);
            res.end('Authentication required');
            return;
        }
        next();
    };
}

function withRole(role) {
    return function(req, res, next) {
        if (!req.identity.roles || !req.identity.roles.includes(role)) {
            res.status(403);
            res.end('Access denied');
            return;
        }
        next();
    }
}

function createTokenFromUser(user, expiration = '31d') {
    return createToken(user._id, user.bio.nickname, user.auth.pwdTimestamp, user.roles, expiration);
}

function createToken(userId, nickname, pwdTimestamp, roles, expiration = '31d') {
    const jwtData = {
        "userId": userId,
        "nickname": nickname,
        "pwdTimestamp": pwdTimestamp
    };
    if (roles) {
        jwtData.roles = roles;
    }
    return jwt.sign(jwtData, process.env.JWT_SECRET, {expiresIn: expiration});
}

const corsPerRoute = corsMiddleware({
    origin: ['http://localhost:8080', 'https://www.mezinamiridici.cz'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    // preflightContinue: false,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
});

module.exports.optional = authenticate(false);
module.exports.required = authenticate(true);
module.exports.poll_admin = withRole('admin:poll');
module.exports.cors = corsPerRoute;
module.exports.createToken=createToken;
module.exports.createTokenFromUser=createTokenFromUser;