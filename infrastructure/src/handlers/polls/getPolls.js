const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const responses = require('../../utils/responses.js');

const response = (status, body) => {
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=600"
        },
        "body": JSON.stringify(body.Items),
        "isBase64Encoded": false
    }
}

exports.handler = (payload, context, callback) => {
    console.log('[getingPolls v1.5]');
    //if userid is provided in the query string then fetch all the pollids from the commenttable
    // console.log(payload);
    var scanObject = {
        "TableName": "BUDPollTable",
    }
    dynamodb.scan(scanObject, (err, data) => {
        if(data != undefined) {
            // console.log(data);
        }
        var commentScanObject = {
            "TableName": "BUDCommentTable",
        }
        if(payload.queryStringParameters != undefined && payload.queryStringParameters.userId) {
            const userId = payload.queryStringParameters.userId;
            // console.log('[userId] ',userId);
            if(userId != undefined) {
                commentScanObject.FilterExpression = "#userId = :userId"
                commentScanObject.ExpressionAttributeNames = {
                    "#userId": "userId",
                }
                commentScanObject.ExpressionAttributeValues = { ":userId": userId }
            }
            dynamodb.scan(commentScanObject,(err,commentList) => {
                var uniquePollIdList = [];
                if(commentList != undefined){
                    // console.log(commentList);
                    commentList.Items.forEach(comment => {
                        if(uniquePollIdList.indexOf(comment.pollId) < 0){
                            uniquePollIdList.push(comment.pollId);
                        }
                    });
                }
                // console.log('[uniquePollIdList] ',uniquePollIdList);
                var filteredPollList = [];
                data.Items.forEach(poll => {
                    // console.log(poll.pollId);
                    uniquePollIdList.forEach(pollId => {
                        // console.log(poll.pollId,pollId)
                        if(poll.pollId == pollId) {
                            // console.log('[Match]')
                            filteredPollList.push(poll);
                        }
                    });
                });
                console.log('[filteredPollList] ',filteredPollList);
                // return responses.OK_200({polls:filteredPollList}, callback, response);
                return callback(null, response(200, {Items:filteredPollList}))
            })
        } else {
            return err ? responses.INTERNAL_SERVER_ERROR_500(err, callback, response) : responses.OK_200(data, callback, response)
        }
    });
};