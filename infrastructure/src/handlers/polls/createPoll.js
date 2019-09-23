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
        "body": JSON.stringify(body.Item),
        "isBase64Encoded": false
    }
}

exports.handler = (payload, context, callback) => {
    const { text, userId } = JSON.parse(payload.body);

    dynamodb.put({
        Item: {
            "pollId": uuidv4(),
            text,
            userId,
            "created": Date.now()
        },
        TableName: "BUDPollTable"
    }, (err, data) => {
        return err ? responses.INTERNAL_SERVER_ERROR_500(err, callback, response) : responses.OK_200(data, callback, response)
    });
};