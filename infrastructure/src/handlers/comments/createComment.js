const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');

const http = require('../../utils/http.js');

exports.handler = (payload, context, callback) => {
    console.log('[createPollComment]');
    console.log(payload.body);
    const { parent, text } = JSON.parse(payload.body);
    const token = payload.headers.Authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
            return http.sendInternalError(callback, err.Item);
        } else {
            return http.sendRresponse(callback, data.Item);
        }
    });
};