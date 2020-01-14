const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');

const http = require('../../utils/http.js');
const SECRET = 'betweenusdrivers2019';

exports.handler = (payload, context, callback) => {
    console.log('[createCommentVote]');
    console.log(payload.body);
    const { vote } = JSON.parse(payload.body);
    const token = payload.headers.Authorization.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);
    const principalId = decoded.userId;
    // const { requestContext: { authorizer: { principalId } } } = payload;
    console.log(payload.pathParameters);
    const { pollId,commentId } = payload.pathParameters;

    const commentVoteId = uuidv4();

    dynamodb.put({
        Item: {
            "commentVoteId": commentVoteId,
            "pollId": pollId,
            "commentId":commentId,
            "userId": principalId,
            "vote":vote
        },
        TableName: "BUDCommentVoteTable"
    }, (err, data) => {
        if (err) {
            return http.sendInternalError(callback, err.Item);
        } else {
            return http.sendRresponse(callback, data.Item);
        }
    });
};