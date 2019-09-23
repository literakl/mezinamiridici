const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const responses = require('../../utils/responses.js');

const response = (status, body) => {
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=600"
        },
        "body": JSON.stringify(body.Item),
        "isBase64Encoded": false
    }
}

exports.handler = (payload, context, callback) => {
    dynamodb.get({
        "TableName": "BUDUserTable",
        "Key": {
            "userId": payload.pathParameters.userId
        },
        "ConsistentRead": false,
    }, (err, data) => {
        const { userId, nickname } = data;
        return err ? responses.INTERNAL_SERVER_ERROR_500(err, callback) : responses.OK_200({userId, nickname}, callback)
    });
};