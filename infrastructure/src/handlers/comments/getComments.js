const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const http = require('../../utils/api.js');

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
            return http.sendInternalError(callback, err.Item);
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
                return http.sendInternalError(callback, err.Item);
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
            return http.sendRresponse(callback, data.Items, "public, max-age=600");
        });
    });
};