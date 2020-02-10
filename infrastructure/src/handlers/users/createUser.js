const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ses = new AWS.SES();
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');

exports.handler = (payload, context, callback) => {
    console.log("handler starts");
    if (payload.body === undefined || payload.body === null) {
        return api.sendBadRequest(callback, api.createError('body is null', "sign-up.something-went-wrong"));
    }

    const {email, password, nickname, termsAndConditions, dataProcessing, emails} = JSON.parse(payload.body);
    let result = validateParameters(email, password, nickname, termsAndConditions, dataProcessing);
    if (! result.success) {
        console.log("validation failed" + result);
        return api.sendBadRequest(callback, result);
    }

    // This freezes node event loop when callback is invoked
    context.callbackWaitsForEmptyEventLoop = false;

    const verificationToken = mongo.generateId(8);
    const userId = mongo.generateTimeId();
    mongo.connectToDatabase()
        .then(dbClient => {
            console.log("Mongo connected");
            return insertUser(dbClient, userId, email, password, nickname, emails, verificationToken);
        })
        .then((data, err) => {
            if (err) {
                console.log("error", err);
                return api.sendInternalError(callback, api.createError('failed to create new user', "sign-up.something-went-wrong"));
            } else {
                const token = jwt.sign({"userId": userId, "nickname": nickname}, process.env.JWT_SECRET, {expiresIn: '1m'});
                return api.sendCreated(callback, api.createResponse(token));
            }
            /*
            todo uncomment for AWS deployment
                        sendVerificationEmail(email, verificationToken, (err, data) => {
                            console.log("email sent " + data);
                            if (err) {
                                return api.sendInternalError(callback, api.createError("Error sending email", "sign-up.something-went-wrong"));
                            } else {
                                const token = jwt.sign({"userId": userId,"nickname": nickname}, process.env.JWT_SECRET, {expiresIn: '1m'});
                                return api.sendCreated(callback, api.createResponse(token));
                            }
                        });
            */
        })
        .catch(err => {
            console.log("Request failed", err);
            result.success = false;
            if (err.code === 11000) {
                if (!!err.keyValue["auth.email"]) {
                    api.addValidationError(result, "email", "email is already registered", "sign-up.email-exists");
                }
                if (!!err.keyValue["auth.login"]) {
                    api.addValidationError(result, "nickname", "nickname has been already taken", "sign-up.nickname-exists");
                }
                return api.sendConflict(callback, result);
            }
            return api.sendInternalError(callback, api.createError('failed to create new user', "sign-up.something-went-wrong"));
        });
};

function insertUser(dbClient, id, email, password, nickname, emails, verificationToken) {
    console.log("insertUser");
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const now = new Date();
    let userDoc = {
        "_id" : id,
        "auth": {
            "email": email,
            "pwdHash": passwordHash,
            "pwdTimestamp": now,
            "verified": false,
            "verifyToken": verificationToken
        },
        "bio": {
            "nickname": nickname
        },
        "driving": {},
        "prefs": {
            "public": true
        },
        "consent": {
            "terms": now,
            "data": now
        }
    };
    if (emails) {
        userDoc.consent.email = now;
        userDoc.prefs.email.newsletter = true;
        userDoc.prefs.email.summary = "daily";
    }

    return dbClient.db().collection("users").insertOne(userDoc);
}

const sendVerificationEmail = (email, token, fn) => {
    const verificationLink = "https://www.mezinamiridici.cz/verify/" + token;
    ses.sendEmail({
        Source: "robot@mezinamiridici.cz",
        Destination: {ToAddresses: [email]},
        Message: {
            Subject: {Data: "Dokončení registrace"},
            Body: {
                Html: {
                    Data: '<html><head>'
                        + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'
                        + '<title>"Dokončení registrace"</title>'
                        + '</head><body>'
                        + '<p><a href="' + verificationLink + '">Dokončit registraci</a>.</p>'
                        + '<p>Pokud odkaz nejde otevřít, zkopírujte následující text a vložte jej do prohlížeče: ' + verificationLink + '</p>'
                        + '</body></html>'
                }
            }
        }
    }, fn);
};

const validateParameters = (email, password, nickname, termsAndConditions, dataProcessing) => {
    let result = { "success": true };
    if (!termsAndConditions) {
        result.success = false;
        api.addValidationError(result, undefined, "Missing consent", "sign-up.consent-missing");
    }
    if (!dataProcessing) {
        result.success = false;
        api.addValidationError(result, undefined, "Missing consent", "sign-up.consent-missing");
    }
    if (!email || email.indexOf("@") === -1 || email.indexOf(".") === -1) {
        result.success = false;
        api.addValidationError(result, "email", "Missing or invalid email", "sign-up.email-required");
    }
    if (!password || password.length < 6) {
        result.success = false;
        api.addValidationError(result, "password", "Missing or short password", "sign-up.password-required");
    }
    if (!nickname || nickname.length < 3) {
        result.success = false;
        api.addValidationError(result, "nickname", "Missing or short nickname", "sign-up.nickname-required");
    }
    return result;
};