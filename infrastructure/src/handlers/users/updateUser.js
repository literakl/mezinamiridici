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
    'INTERNAL_SERVER_ERROR_500': (err, callback) => callback(null, response(500, err))
};

exports.handler = (payload, context, callback) => {
    const { nickname, drivingSince, vehicle, sex, born, region, education, shareProfile } = JSON.parse(payload.body);

    dynamodb.update({
        TableName: 'BUDUserTable',
        Key: { 
            userId: payload.pathParameters.userId
        },
        UpdateExpression: "set nickanme = :nickname, drivingSince = :drivingSince, vehicle = :vehicle, sex = :sex, born = :born, region = :region, education = :education, shareProfile = :shareProfile",
        ExpressionAttributeValues: {
            ":nickname": nickname,
            ":drivingSince": drivingSince,
            ":vehicle": vehicle,
            ":sex": sex,
            ":born": born,
            ":region": region,
            ":education": education,
            ":shareProfile": shareProfile,
        },
        ReturnValues: "UPDATED_NEW"
    }, (err, data) => {
        return err ? responses.INTERNAL_SERVER_ERROR_500(err, callback) : responses.OK_200(data, callback)
    });
};