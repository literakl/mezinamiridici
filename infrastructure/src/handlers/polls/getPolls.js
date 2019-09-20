const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const response = (status, body) => {
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": JSON.stringify(body.Items),
        "isBase64Encoded": false
    }
}

const responses = {
    'OK_200': (data, callback) => callback(null, response(200, data)),
    'INTERNAL_SERVER_ERROR_500': (err, callback) => callback(null, response(500, err))
};

exports.handler = (payload, context, callback) => {
    dynamodb.scan({
        "TableName": "BUDPollTable",
    }, (err, data) => {
        return err ? responses.INTERNAL_SERVER_ERROR_500(err, callback) : responses.OK_200(data, callback)
    });
};