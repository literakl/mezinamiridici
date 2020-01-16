const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const http = require('../../utils/http.js');

exports.handler = (payload, context, callback) => {
    const { userId } = payload.pathParameters;

    dynamodb.query({
        "TableName": "BUDUserVoteTable",
        "IndexName": "UsersVotesFromUserIdIndex",
        "KeyConditionExpression": "#userId = :userId",
        "ExpressionAttributeNames": {
            "#userId": "userId"
        },
        "ExpressionAttributeValues": {
            ":userId": userId
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