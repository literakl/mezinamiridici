const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const bcrypt = require('bcryptjs');

const response = (status, body) => {
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": JSON.stringify(body),
        "isBase64Encoded": false
    }
}

const responses = {
    'OK_200': (data, callback) => callback(null, response(200, data)),
    'FORBIDDEN_403': callback => callback(null, response(403, "Forbbiden")),
    'INTERNAL_SERVER_ERROR_500': (err, callback) => callback(null, response(500, err))
};

exports.handler = (payload, context, callback) => {
    const { email, password } = JSON.parse(payload.body);

    dynamodb.query({
        "TableName": "BUDUserTable",
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

        if(bcrypt.compareSync(password, data.Item.password)){
            return responses.OK_200({
                "authorized": true
            }, callback)
        };

        return responses.FORBIDDEN_403(callback);
    });
};