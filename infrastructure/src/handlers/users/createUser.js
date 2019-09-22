const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4');
var bcrypt = require('bcryptjs');

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
    'INTERNAL_SERVER_ERROR_500': (err, callback) => {
        console.log(err);
        return callback(null, response(500, err))
    }
};

exports.handler = (payload, context, callback) => {
    console.log(payload);
    const { email, password, tandcs, dataProcessing, marketing } = JSON.parse(payload.body);

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    dynamodb.put({
        Item: {
            "userId": uuidv4(),
            "password": passwordHash,
            verified: false,
            email,
            tandcs,
            dataProcessing,
            marketing
        },
        TableName: "BUDUserTable"
    }, (err, data) => {
        console.log(err);
        return err ? responses.INTERNAL_SERVER_ERROR_500(err, callback) : responses.OK_200(data, callback)
    });
};