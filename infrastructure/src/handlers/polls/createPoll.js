const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4');

const response = (status, body) => {
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": JSON.stringify(body.Item),
        "isBase64Encoded": false
    }
}

const responses = {
    'OK_200': (data, callback) => callback(null, response(200, data)),
    'INTERNAL_SERVER_ERROR_500': (err, callback) => callback(null, response(500, err))
};

exports.handler = (payload, context, callback) => {
    const { text, userId } = JSON.parse(payload.body);

    dynamodb.put({
        Item: {
            "pollId": uuidv4(),
            text,
            userId,
            "created": Math.round(new Date().getTime() / 1000)
        },
        TableName: "BUDPollTable"
    }, (err, data) => {
        return err ? responses.INTERNAL_SERVER_ERROR_500(err, callback) : responses.OK_200(data, callback)
    });
};