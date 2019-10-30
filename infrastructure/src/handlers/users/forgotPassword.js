const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4');
var ses = new AWS.SES();

const responses = require('../../utils/responses.js');

const sendVerificationEmail = (email, token, fn) => {
	const subject = "Reset your Between us Drivers password";
	const resetLink = "https://mezinamiridici.cz/reset/" + token;

	ses.sendEmail({
		Source: "jacob.jh.clark@googlemail.com",
		Destination: {
			ToAddresses: [
				"jacob.jh.clark@googlemail.com"
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
            return responses.INTERNAL_SERVER_ERROR_500(err, callback, response);
        }

        const user = data.Items.find(item => item.email === email);

        if (!user) return responses.INTERNAL_SERVER_ERROR_500({}, callback, response)

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
                return responses.INTERNAL_SERVER_ERROR_500(err, callback, response);
            }

            sendVerificationEmail(email, passwordResetToken, (err, emailData) => {
                return err ? responses.INTERNAL_SERVER_ERROR_500(err, callback, response) : responses.OK_200(data, callback, response)
            });
        });
    });
};