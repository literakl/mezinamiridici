const jwt = require('jsonwebtoken');
const corsMW = require('cors');
const dotenv = require('dotenv');
dotenv.config();

function authenticate(required) {
    return function(req, res, next) {
        const { authorization } = req.headers;
        if (authorization) {
            try {
                const token = authorization.split(" ")[1];
                req.identity = jwt.verify(token, process.env.JWT_SECRET); // todo test expiry / modified
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
    // todo
}

function createTokenFromUser(user, expiration = '31d') {
    return createToken(user._id, user.bio.nickname, user.auth.pwdTimestamp, expiration);
}

function createToken(userId, nickname, pwdTimestamp, expiration = '31d') {
    const jwtData = {
        "userId": userId,
        "nickname": nickname,
        "pwdTimestamp": pwdTimestamp
    };
    return jwt.sign(jwtData, process.env.JWT_SECRET, {expiresIn: expiration});
}

const whitelist = ['http://localhost:8080', 'https://www.mezinamiridici.cz']
const corsPerRoute = corsMW({
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
});

module.exports.optional = authenticate(false);
module.exports.required = authenticate(true);
module.exports.admin = withRole('admin');
module.exports.cors = corsPerRoute;
module.exports.createToken=createToken;
module.exports.createTokenFromUser=createTokenFromUser;