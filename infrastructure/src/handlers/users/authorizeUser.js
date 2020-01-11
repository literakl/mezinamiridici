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

const MongoClient = require('mongodb').MongoClient;
const MONGODB_URI = "mongodb+srv://literakl:CgTqEq4nkgLolm5i@atlas-ozgwo.mongodb.net/test?retryWrites=true&w=majority"; // or Atlas connection string

let cachedDb = null;

function connectToDatabase (uri) {
    console.log('=> connect to database');

    if (cachedDb) {
        console.log('=> using cached database instance');
        return Promise.resolve(cachedDb);
    }

    return MongoClient.connect(uri)
        .then(db => {
            cachedDb = db;
            return cachedDb;
        });
}

function queryDatabase (db) {
    console.log('=> query database');

    return db.collection('items').find({}).toArray()
        .then(() => { return { statusCode: 200, body: 'success' }; })
        .catch(err => {
            console.log('=> an error occurred: ', err);
            return { statusCode: 500, body: 'error' };
        });
}

function insertUser(db, email) {
    console.log('=> modify database');
    return db.collection('users').insertOne({"email" : email})
        .then(() => { return { statusCode: 200, body: 'success' }; })
        .catch(err => {
            console.log('=> an error occurred: ', err);
            return { statusCode: 500, body: 'error' };
        });
}

exports.handler = (payload, context, callback) => {
    const { email, password } = JSON.parse(payload.body);

    context.callbackWaitsForEmptyEventLoop = false;
    connectToDatabase(MONGODB_URI)
        .then(db => insertUser(db, email))
        .then(result => {
            console.log('=> returning result: ', result);
            // callback(null, result);
        })
        .catch(err => {
            console.log('=> an error occurred: ', err);
            return responses.INTERNAL_SERVER_ERROR_500(err, callback, response);
        });
    console.log('mongo insert succeeded');

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
            return responses.INTERNAL_SERVER_ERROR_500(err, callback, response);
        }

        const user = data.Items.find(item => item.email === email);

        if(!user.verified){
            return responses.FORBIDDEN_403(callback, response);
        }

        if(bcrypt.compareSync(password, user.password)){
            const token = jwt.sign({
                "userId": user.userId,
                "nickname": user.nickname.toLowerCase()
            }, SECRET);

            return responses.OK_200({
                token
            }, callback, response)

        };

        return responses.FORBIDDEN_403(callback, response);
    });
};