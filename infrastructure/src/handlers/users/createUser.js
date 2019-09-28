const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var ses = new AWS.SES();

const responses = require('../../utils/responses.js');

const SECRET = 'betweenusdrivers2019';

const sendVerificationEmail = (email, token, fn) => {
	const subject = "Verify your Between us Drivers account";
	const verificationLink = "https://betweenusdrivers.jacobclark.dev/verify/" + token;

	ses.sendEmail({
		Source: "jacob.jh.clark@googlemail.com",
		Destination: {
			ToAddresses: [
				email
			]
		},
		Message: {
			Subject: {
				Data: subject
			},
			Body: {
				Html: {
					Data: '<html><head>'
					+ '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'
					+ '<title>' + subject + '</title>'
					+ '</head><body>'
					+ 'Please <a href="' + verificationLink + '">click here to verify your email address</a> or copy & paste the following link in a browser:'
					+ '<br><br>'
					+ '<a href="' + verificationLink + '">' + verificationLink + '</a>'
					+ '</body></html>'
				}
			}
		}
	}, fn);
}

const response = (status, body) => {
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "private"
        },
        "body": JSON.stringify(body.Item),
        "isBase64Encoded": false
    }
}

exports.handler = (payload, context, callback) => {
    const { email, password, tandcs, dataProcessing, marketing } = JSON.parse(payload.body);

    // TODO - Error if user account already exists

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const userId = uuidv4();
    const verificationToken = uuidv4();

    dynamodb.put({
        Item: {
            "userId": userId,
            "password": passwordHash,
            verified: false,
            email,
            tandcs,
            dataProcessing,
            marketing,
            verificationToken: verificationToken,
            registrationDate: Date.now()
        },
        TableName: "BUDUserTable"
    }, (err, data) => {
        sendVerificationEmail(email, verificationToken, (err, data) => {
            const token = jwt.sign({
                "userId": userId
            }, SECRET, { expiresIn: '1m' });

            return err ? responses.INTERNAL_SERVER_ERROR_500(err, callback, response) : responses.OK_200({ Item: { token } }, callback, response)
        });

    });
};