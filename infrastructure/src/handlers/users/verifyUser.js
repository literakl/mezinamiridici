const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const http = require('../../utils/http.js');

exports.handler = (payload, context, callback) => {
    const { token } = payload.pathParameters;

    dynamodb.query({
        "TableName": "BUDUserTable",
        "IndexName": "UserFromVerificationTokenIndex",
        "KeyConditionExpression": "#verificationToken = :verificationToken",
        "ExpressionAttributeNames": {
            "#verificationToken": "verificationToken"
        },
        "ExpressionAttributeValues": {
            ":verificationToken": token
        },
        "ConsistentRead": false,
    }, (err, data) => {
        if(err){
            return http.sendInternalError(callback, err.Item);
        }

        const user = data.Items.find(item => item.verificationToken === token);

        if(user.verified){
            return http.sendErrorForbidden(callback, "Forbidden");
        }

        dynamodb.update({
            TableName: 'BUDUserTable',
            Key: { 
                "userId": user.userId
            },
            UpdateExpression: "set verified = :verified",
            ExpressionAttributeValues: {
                ":verified": true,
            }
        }, (err, data) => {
            if (err) {
                return http.sendInternalError(callback, err.Item);
            } else {
                return http.sendRresponse(callback, data.Item);
            }
        });
    });
};