const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const api = require('../../utils/api.js');

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
            return api.sendInternalError(callback, err.Item);
        } else {
            return api.sendRresponse(callback, data.Items, "public, max-age=600");
        }
    });
};