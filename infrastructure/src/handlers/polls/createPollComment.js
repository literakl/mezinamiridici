const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4');

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
    const { parent, text } = JSON.parse(payload.body);
    const { requestContext: { authorizer: { principalId } } } = payload;
    const { pollId } = payload.pathParameters;

    const commentId = uuidv4();

    console.log({
        "commentId": commentId,
        "pollId": pollId,
        "userId": principalId,
        "parent": parent ? parent : commentId,
        "text": text,
        "created": Date.now()
    });

    dynamodb.put({
        Item: {
            "commentId": commentId,
            "pollId": pollId,
            "userId": principalId,
            "parent": parent ? parent : commentId,
            "text": text,
            "created": Date.now()
        },
        TableName: "BUDCommentTable"
    }, (err, data) => {
        if (err) {
            return responses.INTERNAL_SERVER_ERROR_500(err, callback, response);
        }

        return err ? responses.INTERNAL_SERVER_ERROR_500(err, callback, response) : responses.OK_200(data, callback, response)
    });
};