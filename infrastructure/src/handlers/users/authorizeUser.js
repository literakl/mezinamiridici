const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const responses = require('../../utils/responses.js');

const SECRET = 'betweenusdrivers2019';

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
    const { email, password } = JSON.parse(payload.body);

    dynamodb.query({
        "TableName": "BUDUserTable",
        "IndexName": "PasswordFromEmailIndex",
        "KeyConditionExpression": "#email = :email",
        "ExpressionAttributeNames": {
            "#email": "email"
        },
        "ExpressionAttributeValues": {
            ":email": email
        },
        "ConsistentRead": false,
    }, (err, data) => {
        if(err){
            return responses.INTERNAL_SERVER_ERROR_500(err, callback);
        }

        const user = data.Items.find(item => item.email === email);

        if(!user.verified){
            return responses.FORBIDDEN_403(callback, response);
        }

        if(bcrypt.compareSync(password, user.password)){
            const token = jwt.sign({
                email
            }, SECRET);

            return responses.OK_200({
                token
            }, callback, response)

        };

        return responses.FORBIDDEN_403(callback, response);
    });
};