const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4');
var shortid = require('shortid');
const slug = require('limax');

const http = require('../../utils/api.js');

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
            console.log('[err]',err);
        if(data)
            console.log('[data]',data);
        if (err) {
             return http.sendInternalError(callback, err.Item);
        } else {
             return http.sendRresponse(callback, data.Item);
        }
    });
};