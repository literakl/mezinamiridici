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
    const { nickname, drivingSince, vehicle, sex, born, locationalRegion, education, shareProfile } = JSON.parse(payload.body);

    dynamodb.update({
        TableName: 'BUDUserTable',
        Key: { 
            "userId": payload.pathParameters.userId
        },
        UpdateExpression: "set nickname = :nickname, drivingSince = :drivingSince, vehicle = :vehicle, sex = :sex, born = :born, locationalRegion = :locationalRegion, education = :education, shareProfile = :shareProfile",
        ExpressionAttributeValues: {
            ":nickname": nickname ? nickname : null,
            ":drivingSince": drivingSince ? drivingSince : null,
            ":vehicle": vehicle ? vehicle : [],
            ":sex": sex ? sex : null,
            ":born": born ? born : null,
            ":locationalRegion": locationalRegion ? locationalRegion : null, 
            ":education": education ? education : null,
            ":shareProfile": shareProfile ? shareProfile : 'everything',
        },
        ReturnValues: "UPDATED_NEW"
    }, (err, data) => {
        return err ? responses.INTERNAL_SERVER_ERROR_500(err, callback, response) : responses.OK_200(data, callback, response)
    });
};