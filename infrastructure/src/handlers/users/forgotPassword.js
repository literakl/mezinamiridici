const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4');
var ses = new AWS.SES();

const api = require('../../utils/api.js');
//             "Access-Control-Allow-Headers": "*",

const sendVerificationEmail = (email, token, fn) => {
	const subject = "Reset your Between us Drivers password";
	const resetLink = "https://mezinamiridici.cz/reset/" + token;

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
					+ 'Please <a href="' + resetLink + '">click here to reset your password</a> or copy & paste the following link in a browser:'
					+ '<br><br>'
					+ '<a href="' + resetLink + '">' + resetLink + '</a>'
					+ '</body></html>'
				}
			}
		}
	}, fn);
}

exports.handler = (payload, context, callback) => {
    const { email } = JSON.parse(payload.body);
    const passwordResetToken = uuidv4();

    dynamodb.query({
        "TableName": "BUDUserTable",
        "IndexName": "PasswordFromEmailIndex",
        "KeyConditionExpression": "#email = :email",
        "ExpressionAttributeNames": {
            "#email": "email"
        },
        "ExpressionAttributeValues": {
            ":email": email
        },
        "ConsistentRead": false,
    }, (err, data) => {
        if (err) {
            return api.sendInternalError(callback, err.Item);
        }

        const user = data.Items.find(item => item.email === email);

        if (!user)
            return api.sendInternalError(callback, {})

        dynamodb.update({
            TableName: 'BUDUserTable',
            Key: {
                "userId": user.userId
            },
            UpdateExpression: "set passwordResetToken = :passwordResetToken",
            ExpressionAttributeValues: {
                ":passwordResetToken": passwordResetToken
            },
            ReturnValues: "UPDATED_NEW"
        }, (err, data) => {
            if (err) {
                return api.sendInternalError(callback, err.Item);
            }

            sendVerificationEmail(email, passwordResetToken, (err, emailData) => {
                if (err) {
                    return api.sendInternalError(callback, err.Item);
                } else {
                    return api.sendRresponse(callback, data.Item);
                }
            });
        });
    });
};