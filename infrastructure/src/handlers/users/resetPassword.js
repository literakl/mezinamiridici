const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const bcrypt = require('bcryptjs');

const responses = require('../../utils/responses.js');

const response = (status, body) => {
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Cache-Control": "private"
        },
        "body": JSON.stringify(body),
        "isBase64Encoded": false
    }
}

exports.handler = (payload, context, callback) => {
    const { resetPasswordToken, password } = JSON.parse(payload.body);

    dynamodb.query({
        "TableName": "BUDUserTable",
        "IndexName": "UserFromResetPasswordTokenIndex",
        "KeyConditionExpression": "#resetPasswordToken = :resetPasswordToken",
        "ExpressionAttributeNames": {
            "#resetPasswordToken": "resetPasswordToken"
        },
        "ExpressionAttributeValues": {
            ":resetPasswordToken": resetPasswordToken
        },
        "ConsistentRead": false,
    }, (err, data) => {
        if (err) {
            return responses.INTERNAL_SERVER_ERROR_500(err, callback, response);
        }

        console.log(data);

        const user = data.Items.find(item => item.email === email);

        if (!user) return responses.INTERNAL_SERVER_ERROR_500({}, callback, response)

        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);

        dynamodb.update({
            TableName: 'BUDUserTable',
            Key: {
                "userId": user.userId
            },
            UpdateExpression: "set password = :password",
            ExpressionAttributeValues: {
                ":password": passwordHash
            },
            ReturnValues: "UPDATED_NEW"
        }, (err, data) => {
            return err ? responses.INTERNAL_SERVER_ERROR_500(err, callback, response) : responses.OK_200(data, callback, response)
        });
    });
};