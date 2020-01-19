const generate = require('nanoid/generate');
const MongoClient = require('mongodb').MongoClient;

exports.connectToDatabase = connectToDatabase;
exports.generateId = generateId;
exports.generateTimeId = generateTimeId;

let MONGODB_URI = process.env.MONGODB_URI;
let cachedDb = null;

function connectToDatabase() {
    console.log("Connect to mongo database");

    if (!!cachedDb && !!cachedDb.topology && cachedDb.topology.isConnected()) {
        console.log("Using cached database instance");
        return Promise.resolve(cachedDb);
    }

    return MongoClient.connect(MONGODB_URI)
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

// Takes milliseconds and appends a random character to avoid sub-millisecond conflicts
function generateTimeId() {
    return Date.now().toString(32) + Number(Math.random() * 35).toString(36);
}

function generateId (idLength = 10) {
    return generate('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', idLength);
}
