const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4');
var shortid = require('shortid');
const slug = require('limax');

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
    console.log('[creatingPoll]',text,userId)

    dynamodb.put({
        Item: {
            "pollId": shortid.generate(),
            "seoText":slug(text),
            text,
            userId,
            "created": Date.now()
        },
        TableName: "BUDPollTable"
    }, (err, data) => {
        if(err)
            console.log('[err]',err)
        if(data)
            console.log('[data]',data);
        return err ? responses.INTERNAL_SERVER_ERROR_500(err, callback, response) : responses.OK_200(data, callback, response)
    });
};