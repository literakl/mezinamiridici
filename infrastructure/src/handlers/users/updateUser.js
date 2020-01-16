const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4');
var bcrypt = require('bcryptjs');

const http = require('../../utils/http.js');

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
        if (err) {
            return http.sendInternalError(callback, err.Item);
        } else {
            return http.sendRresponse(callback, data.Item);
        }
    });
};