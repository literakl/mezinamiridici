const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const MongoClient = require('mongodb').MongoClient;

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

const MONGODB_URI = "mongodb+srv://literakl:CgTqEq4nkgLolm5i@atlas-ozgwo.mongodb.net/bud?retryWrites=true&w=majority";

let cachedDb = null;

function connectToDatabase(uri) {
    console.log("Connect to mongo database");

    if (!!cachedDb && !!cachedDb.topology && cachedDb.topology.isConnected()) {
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
            throw err;
        });
}

function insertUser(dbClient, email) {
    console.log("insertUser");
    return dbClient.db()
        .collection("users")
        .insertOne({ email: email, created: new Date() })
        .catch(err => {
            console.log("Insert error occurred: ", err);
        });
}

function findUser(dbClient, email) {
    console.log("findUser");
    return dbClient.db()
        .collection("users")
        .findOne({ email: email })
        .then(doc => {
            if(!doc)
                throw new Error('No record found for ' + email);
            console.log(doc);
            return doc;
        });
}

exports.handler = (payload, context, callback) => {
    const { email, password } = JSON.parse(payload.body);
    console.log("handler starts");

    // This freezes node event loop when callback is invoked
    context.callbackWaitsForEmptyEventLoop = false;

    connectToDatabase(MONGODB_URI)
        .then(db => {
            console.log("Mongo connected");
            return findUser(db, email);
        })
        .then(user => {
            console.log("Mongo search succeeded");

            // if(!user.verified){
            //     return responses.FORBIDDEN_403(callback, response);
            // }

            if (bcrypt.compareSync(password, user.password)) {
                const token = jwt.sign({
                    "userId": user.email,
                    "nickname": user.nickname
                }, SECRET);
                console.log("All good");
                return responses.OK_200({token}, callback, response)
            } else {
                console.log("Password mismatch for user " + user._id);
                return responses.FORBIDDEN_403(callback, response);
            }
        })
        .catch(err => {
            console.log("Request failed", err);
            return responses.INTERNAL_SERVER_ERROR_500(err, callback, response);
        });

    console.log("At the end");
};