const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');

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
    const { score } = JSON.parse(payload.body);
    const { pollId } = payload.pathParameters;

    console.log(payload, context);

    const voteId = uuidv4();

    dynamodb.put({
        Item: {
            "voteId": voteId,
            "pollId": pollId,
            "vote": score
        },
        TableName: "BUDVoteTable"
    }, (err, data) => {
        return err ? responses.INTERNAL_SERVER_ERROR_500(err, callback, response) : responses.OK_200(data, callback, response)
    });
};