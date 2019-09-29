const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const responses = require('../../utils/responses.js');

const response = (status, body) => {
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "private"
        },
        "body": JSON.stringify(body),
        "isBase64Encoded": false
    }
}

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
            return responses.INTERNAL_SERVER_ERROR_500(err, callback, response);
        }

        const user = data.Items.find(item => item.verificationToken === verificationToken);

        if(user.verified){
            return responses.FORBIDDEN_403(callback, response);
        }

        dynamodb.update({
            TableName: 'BUDUserTable',
            Key: { 
                "userId": user.userId
            },
            UpdateExpression: "set verified = :verified",
            ExpressionAttributeValues: {
                ":verified": verified,
            },
            ReturnValues: "UPDATED_NEW"
        }, (err, data) => {
            return err ? responses.INTERNAL_SERVER_ERROR_500(err, callback, response) : responses.OK_200(data, callback, response)
        });
    });
};