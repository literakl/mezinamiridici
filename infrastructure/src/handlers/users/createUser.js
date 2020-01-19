const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ses = new AWS.SES();
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
//             "Access-Control-Allow-Headers": "*",

exports.handler = (payload, context, callback) => {
    console.log("handler starts");
    if (payload.body === undefined || payload.body === null) {
        return api.sendRresponse(callback, {success: false, response: 'body is null'});
    }

    const {email, password, nickname, termsAndConditions, dataProcessing, emails} = JSON.parse(payload.body);
    let result = validateParameters(email, password, nickname, termsAndConditions, dataProcessing);
    if (! result.success) {
        return api.sendBadRequest(callback, result);
    }

    // This freezes node event loop when callback is invoked
    context.callbackWaitsForEmptyEventLoop = false;

    const verificationToken = mongo.generateId(8);
    mongo.connectToDatabase()
        .then(db => {
            console.log("Mongo connected");
            return insertUser(db, email, password, nickname, emails, verificationToken);
        })
        .then((err, data) => {
            if (data)
                console.log('data', data);
            sendVerificationEmail(email, verificationToken, (err, data) => {
                console.log("email sent"+data);
                if (err) {
                    return api.sendInternalError(callback, api.createError(3001, err.Item));
                } else {
                    const token = jwt.sign({"userId": userId,"nickname": nickname}, process.env.JWT_SECRET, {expiresIn: '1m'});
                    return api.sendCreated(callback, api.createResponse(token));
                }
            });
        })
        .catch(err => {
            console.log("Request failed", err);
            if (err.code === 11000) {
                console.log(err.keyValue);
                return api.sendConflict(callback, api.createError(1002, 'email or nickname already exists'));
            }
            return api.sendConflict(callback, api.createError(1002, 'email or nickname already exists'));
        });
};

function insertUser(dbClient, email, password, nickname, emails, verificationToken) {
    console.log("insertUser");
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const now = new Date();
    let userDoc = {
        "_id" : mongo.generateTimeId(),
        "auth": {
            "email": email,
            "pwdHash": passwordHash,
            "verified": false,
            "verifyToken": verificationToken
        },
        "bio": {
            "nickname": nickname
        },
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
        api.addValidationError(result, 1000, "termsAndConditions", "Missing consent");
    }
    if (!dataProcessing) {
        result.success = false;
        api.addValidationError(result, 1000, "dataProcessing", "Missing consent");
    }
    if (!email) {
        result.success = false;
        api.addValidationError(result, 1000, "email", "Missing email");
    } else {
        if (email.indexOf("@") === -1 || email.indexOf(".") === -1) {
            result.success = false;
            api.addValidationError(result, 1001, "email", "Invalid email");
        }
    }
    if (!password) {
        result.success = false;
        api.addValidationError(result, 1000, "password", "Missing password");
    } else {
        if (password.length < 6) {
            result.success = false;
            api.addValidationError(result, 1001, "password", "Password too short");
        }
    }
    if (!nickname) {
        result.success = false;
        api.addValidationError(result, 1000, "nickname", "Missing nickname");
    }
    return result;
};