const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4');
var bcrypt = require('bcryptjs');

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
    const { email, password, tandcs, dataProcessing, marketing } = JSON.parse(payload.body);

    console.log(payload.body);

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const userId = uuidv4();

    dynamodb.put({
        Item: {
            "userId": userId,
            "password": passwordHash,
            verified: false,
            email,
            tandcs,
            dataProcessing,
            marketing,
            verificationToken: uuidv4(),
            registrationDate: new Date()
        },
        TableName: "BUDUserTable"
    }, (err, data) => {
        return err ? responses.INTERNAL_SERVER_ERROR_500(err, callback, response) : responses.OK_200({ Item: { userId } }, callback, response)
    });
};