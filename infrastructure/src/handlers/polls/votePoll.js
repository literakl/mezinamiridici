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
    const { requestContext: { authorizer: { principalId }} } = payload;
    const { pollId } = payload.pathParameters;

    if(score === undefined || score === null) return responses.INTERNAL_SERVER_ERROR_500("score is required", callback, response)

    const voteId = uuidv4();
    const userVoteId = uuidv4();

    dynamodb.get({
        "TableName": "BUDUserTable",
        "Key": {
            "userId": principalId
        },
        "ConsistentRead": false,
    }, (err, userData) => {
        if(err) {
            return responses.INTERNAL_SERVER_ERROR_500(err, callback, response);
        }

        dynamodb.put({
            Item: {
                "voteId": voteId,
                "pollId": pollId,
                "vote": score,
                "age": userData.Item.born ? new Date().getFullYear() - parseInt(userData.Item.born) : null,
                "drivingFor": userData.Item.drivingSince ? new Date().getFullYear() - parseInt(userData.Item.drivingSince) : null,
                "education": userData.Item.education ? userData.Item.education : null,
                "sex": userData.Item.sex ? userData.Item.sex : null,
                "region": userData.Item.locationalRegion ? userData.Item.locationalRegion : null,
                "vehicle": userData.Item.vehicle ? userData.Item.vehicle : null,
                "created": Date.now()
            },
            TableName: "BUDVoteTable"
        }, (err, voteData) => {
            if(err) {
                return responses.INTERNAL_SERVER_ERROR_500(err, callback, response);
            }

            dynamodb.put({
                Item: {
                    "userVoteId": userVoteId,
                    "voteId": voteId,
                    "pollId": pollId,
                    "userId": principalId
                },
                TableName: "BUDUserVoteTable"
            }, (err, userVoteData) => {
                return err ? responses.INTERNAL_SERVER_ERROR_500(err, callback, response) : responses.OK_200(userVoteData, callback, response)
            })
        });
    });
};