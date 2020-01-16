const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const bcrypt = require('bcryptjs');

const http = require('../../utils/http.js');
//            "Access-Control-Allow-Headers": "*",

exports.handler = (payload, context, callback) => {
    const { passwordResetToken, password } = JSON.parse(payload.body);

    dynamodb.query({
        "TableName": "BUDUserTable",
        "IndexName": "UserFromPasswordResetTokenIndex",
        "KeyConditionExpression": "#passwordResetToken = :passwordResetToken",
        "ExpressionAttributeNames": {
            "#passwordResetToken": "passwordResetToken"
        },
        "ExpressionAttributeValues": {
            ":passwordResetToken": passwordResetToken
        },
        "ConsistentRead": false,
    }, (err, data) => {
        if (err) {
            return http.sendInternalError(callback, err.Item);
        }

        const user = data.Items.find(item => item.passwordResetToken === passwordResetToken);

        if (!user)
            return http.sendInternalError(callback, {});

        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);

        dynamodb.update({
            TableName: 'BUDUserTable',
            Key: {
                "userId": user.userId
            },
            UpdateExpression: "SET password = :password REMOVE passwordResetToken",
            ExpressionAttributeValues: {
                ":password": passwordHash
            },
            ReturnValues: "UPDATED_NEW"
        }, (err, data) => {
            if (err) {
                return http.sendInternalError(callback, err.Item);
            } else {
                return http.sendRresponse(callback, data.Item);
            }
        });
    });
};