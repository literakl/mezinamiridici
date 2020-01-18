const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');

const http = require('../../utils/http.js');

exports.handler = (payload, context, callback) => {
    console.log(payload.body);
    const { score } = JSON.parse(payload.body);
    const token = payload.headers.Authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const principalId = decoded.userId;
    // const { requestContext: { authorizer: { principalId }} } = payload;
    const { pollId } = payload.pathParameters;

    if (score === undefined || score === null)
        return http.sendInternalError(callback, "score is required");

    const voteId = uuidv4();
    const userVoteId = uuidv4();

    dynamodb.get({
        "TableName": "BUDUserTable",
        "Key": {
            "userId": principalId
        },
        "ConsistentRead": false,
    }, (err, userData) => {
        if(err)
            console.log('[err]',err)
        if(err) {
            return http.sendInternalError(callback, err.Item);
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
                console.log('[err]',err)
                return http.sendInternalError(callback, err.Item);
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
                if (err) {
                    console.log('[err]',err)
                    return http.sendInternalError(callback, err.Item);
                } else {
                    return http.sendRresponse(callback, userVoteData.Item);
                }
            })
        });
    });
};