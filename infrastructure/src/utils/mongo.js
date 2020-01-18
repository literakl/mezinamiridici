const generate = require('nanoid/generate');
const MongoClient = require('mongodb').MongoClient;

exports.connectToDatabase = connectToDatabase;
exports.generateId = generateId;

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

// todo remove logs once analyzed
function generateId (idLength = 10) {
    const start = Date.now();
    const x = generate('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', idLength);
    console.log("generateId took " + (Date.now() - start) + " ms");
    return x;
}
