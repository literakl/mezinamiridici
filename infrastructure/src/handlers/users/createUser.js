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
    const verificationLink = "https://mezinamiridici.cz/verify/" + token;

	ses.sendEmail({
		Source: "robot@mezinamiridici.cz",
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
            "Access-Control-Allow-Headers": "*",
            "Cache-Control": "private"
        },
        "body": JSON.stringify(body),
        "isBase64Encoded": false
    }
}

exports.handler = (payload, context, callback) => {
    console.log('[createUser Method] v1.5');
    if (payload.body != undefined) {
        // payload.body = JSON.stringify(payload.body)
        const { email, password, nickname, tandcs, dataProcessing, marketing } = JSON.parse(payload.body);
        // TODO - Error if user account already exists
        if (email != undefined && password != undefined && nickname != undefined && tandcs && dataProcessing) {
            var nicknameUpperCase = nickname.toUpperCase();
            dynamodb.scan({
                "TableName": "BUDUserTable",
                "FilterExpression": "#email = :email OR #nickname = :nickname",
                "ExpressionAttributeNames": {
                    "#email": "email",
                    "#nickname": "nickname"
                },
                "ExpressionAttributeValues": {
                    ":email": email,
                    ":nickname": nicknameUpperCase
                },
                "ConsistentRead": false,
            }, (err, data) => {
                if (err) {
                    return responses.INTERNAL_SERVER_ERROR_500(err, callback, response);
                }
                if(data != undefined && data.Count > 0){
                    return responses.OK_200({success:false, message:'email or nickname is already exist'}, callback, response)
                } else {
                    const salt = bcrypt.genSaltSync(10);
                    const passwordHash = bcrypt.hashSync(password, salt);
                    const userId = uuidv4();
                    const verificationToken = uuidv4();
                    dynamodb.put({
                        Item: {
                            userId,
                            "password": passwordHash,
                            "nickname":nicknameUpperCase,
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
                        if (err)
                            console.log('err', err);
                        if (data)
                            console.log('data', data);
                        sendVerificationEmail(email, verificationToken, (err, data) => {
                        const token = jwt.sign({
                            "userId": userId,
                            "nickname": nickname
                        }, SECRET, { expiresIn: '1m' });

                        return err ? responses.INTERNAL_SERVER_ERROR_500(err, callback, response) : responses.OK_200({ token }, callback, response)
                        });

                    });
                }
            });
        } else {
            return callback(null, response(200, { success:false, response: 'bad request' }));
        }
    } else {
        return callback(null, response(200, { success:false, response: 'body is null' }));
    }
};