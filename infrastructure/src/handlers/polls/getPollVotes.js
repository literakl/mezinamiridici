const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const http = require('../../utils/http.js');

exports.handler = (payload, context, callback) => {
    const { pollId } = payload.pathParameters;

    dynamodb.query({
        "TableName": "BUDVoteTable",
        "IndexName": "VoteFromPollIdIndex",
        "KeyConditionExpression": "#pollId = :pollId",
        "ExpressionAttributeNames": {
            "#pollId": "pollId"
        },
        "ExpressionAttributeValues": {
            ":pollId": pollId
        },
        "ConsistentRead": false,
    }, (err, data) => {
        if (err) {
            return http.sendInternalError(callback, err.Item);
        } else {
            return http.sendRresponse(callback, data.Items, "public, max-age=600");
        }
    });
};