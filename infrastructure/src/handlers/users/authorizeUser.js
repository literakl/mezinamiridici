const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const MongoClient = require('mongodb').MongoClient;

const http = require('../../utils/http.js');

// TODO this needs to be externalized
const SECRET = 'betweenusdrivers2019';

let MONGODB_URI = process.env.MONGODB_URI;
console.log("Mongo parameter: " + MONGODB_URI);

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
            console.log("User was found"); // following part takes more than 1 second!

            // if(!user.verified){
            //     return responses.FORBIDDEN_403(callback, responses.sendRresponse);
            // }

            if (bcrypt.compareSync(password, user.password)) {
                console.log("Password verified"); //
                const token = jwt.sign({
                    "userId": user.email,
                    "nickname": user.nickname
                }, SECRET);
                console.log("All good");
                return http.sendRresponse(callback, {token});
            } else {
                console.log("Password mismatch for user " + user._id);
                return http.sendErrorForbidden(callback,"Forbbiden");
            }
        })
        .catch(err => {
            console.log("Request failed", err);
            return http.sendInternalError(callback, err.Item);
        });
};