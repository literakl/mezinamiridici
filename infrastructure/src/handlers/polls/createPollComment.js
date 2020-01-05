const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');

const responses = require('../../utils/responses.js');
const SECRET = 'betweenusdrivers2019';
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
    console.log('[createPollComment]');
    console.log(payload.body);
    const { parent, text } = JSON.parse(payload.body);
    const token = payload.headers.Authorization.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);
    const principalId = decoded.userId;
    // const { requestContext: { authorizer: { principalId } } } = payload;
    const { pollId } = payload.pathParameters;

    const commentId = uuidv4();

    dynamodb.put({
        Item: {
            "commentId": commentId,
            "pollId": pollId,
            "userId": principalId,
            "parent": parent,
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