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

    function connectToDatabase(uri) {
        console.log("Connect to mongo database");

        if (cachedDb) {
            console.log("Using cached database instance");
            return Promise.resolve(cachedDb);
        }

        return MongoClient.connect(uri)
            .then(db => {
                console.log("Successful connect");
                cachedDb = db;
                return cachedDb;
            })
            .catch(err => {
                console.log("Connection error occurred: ", err);
            });
    }

    function insertUser(db, email) {
        console.log("=> modify database");
        return db
            .collection("users")
            .insertOne({ email: email })
            .catch(err => {
                console.log("Insert error occurred: ", err);
                callback(err);
            });
    }

    exports.handler = (payload, context, callback) => {
        const { email, password } = JSON.parse(payload.body);

        context.callbackWaitsForEmptyEventLoop = false;
        connectToDatabase(MONGODB_URI)
            .then(db => {
                console.log("Mongo connected");
                return insertUser(db, email);
            })
            .then(result => {
                console.log("Mongo insert succeeded", result);
                callback(null, result);
            })
            .catch(err => {
                console.log("Mongo insert failed", err);
                callback(err, null);
                return responses.INTERNAL_SERVER_ERROR_500(err, callback, response);
            });

        console.log('finished mongo stuff');

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

        }

        return responses.FORBIDDEN_403(callback, response);
    });
};