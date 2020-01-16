const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const http = require('../../utils/http.js');

exports.handler = (payload, context, callback) => {
    dynamodb.get({
        "TableName": "BUDUserTable",
        "Key": {
            "userId": payload.pathParameters.userId
        },
        "ConsistentRead": false,
    }, (err, data) => {
        delete data.password;
        delete data.marketing;
        delete data.verificationToken;
        delete data.verified;
        delete data.dataProcessing;
        delete data.email;
        if(data.Item.nickname != undefined)
            data.Item.nickname = data.Item.nickname.toLowerCase()

        if (err) {
            return http.sendInternalError(callback, err.Item);
        } else {
            return http.sendRresponse(callback, data.Item, "public, max-age=600");
        }
    });
};