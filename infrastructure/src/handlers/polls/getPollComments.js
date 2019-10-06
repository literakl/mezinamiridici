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
        "body": JSON.stringify(body.Items),
        "isBase64Encoded": false
    }
}

exports.handler = (payload, context, callback) => {
    const { pollId } = payload.pathParameters;

    dynamodb.query({
        "TableName": "BUDCommentTable",
        "IndexName": "CommentsFromPollIdIndex",
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
            return responses.INTERNAL_SERVER_ERROR_500(err, callback, response);
        }

        console.log(err);
        console.log(data);

        return responses.OK_200({
            data
        }, callback, response)
    });
};