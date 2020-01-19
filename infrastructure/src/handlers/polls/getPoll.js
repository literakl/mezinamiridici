const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const http = require('../../utils/api.js');

exports.handler = (payload, context, callback) => {
    dynamodb.get({
        "TableName": "BUDPollTable",
        "Key": {
            "pollId": payload.pathParameters.pollId
        },
        "ConsistentRead": false,
    }, (err, data) => {
        if (err) {
            return http.sendInternalError(callback, err.Item);
        } else {
            return http.sendRresponse(callback, data.Item, "public, max-age=600");
        }
    });
};