module.exports.connectToDatabase = connectToDatabase;

const MongoClient = require('mongodb').MongoClient;
let MONGODB_URI = process.env.MONGODB_URI;
console.log("Mongo parameter: " + MONGODB_URI);

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
