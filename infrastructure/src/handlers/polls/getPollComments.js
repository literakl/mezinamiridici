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
    const { pollId } = payload.pathParameters;

    dynamodb.query({
        "TableName": "BUDCommentTable",
        "IndexName": "CommentsFromPollIdIndex",
        "KeyConditionExpression": "#pollId = :pollId",
        "ExpressionAttributeNames": {
            "#pollId": "pollId"
        },
        "ExpressionAttributeValues": {
            ":pollId": pollId
        },
        "ConsistentRead": false,
    }, (err, data) => {
        if (err) {
            return responses.INTERNAL_SERVER_ERROR_500(err, callback, response);
        }
        console.log(pollId);
        dynamodb.scan({
            "TableName": "BUDCommentVoteTable",
            "FilterExpression": "#pollId = :pollId",
            "ExpressionAttributeNames": {
                "#pollId": "pollId"
            },
            "ExpressionAttributeValues": {
                ":pollId": pollId
            },
            "ConsistentRead": false,
        }, (err, commentVoteList) => {
            if (err) {
                console.log(err);
                return responses.INTERNAL_SERVER_ERROR_500(err, callback, response);
            }
            data.Items.forEach(comment => {
                commentVoteList.Items.forEach(commentVote => {
                    if(comment.commentId == commentVote.commentId){
                        if(commentVote.vote == 1){
                            comment.upvotes = (comment.upvotes || 0) + 1;
                        } else {
                            comment.downvotes = (comment.downvotes || 0)+ 1;
                        }
                    }
                });
            });
            console.log(data.Items);
            console.log(commentVoteList);
            return responses.OK_200(data, callback, response)
        });
    
        // return responses.OK_200(data, callback, response)
    });
};