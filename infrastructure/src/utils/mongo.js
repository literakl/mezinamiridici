const generate = require('nanoid/generate');
const MongoClient = require('mongodb').MongoClient;

exports.connectToDatabase = connectToDatabase;
exports.generateId = generateId;
exports.generateTimeId = generateTimeId;
exports.findUser = findUser;

let MONGODB_URI = process.env.MONGODB_URI;
let cachedDb = null;

function connectToDatabase() {
    console.log("Connect to mongo database " + MONGODB_URI);

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

function findUser(dbClient, params, projection) {
    const query = {};
    if (params.userId) {
        query._id = params.userId;
    }
    if (params.email) {
        query['auth.email'] = params.email;
    }
    if (params.token) {
        query['auth.verifyToken'] = params.token;
    }
    if (params.resetPasswordToken) {
        query['auth.reset.token'] = params.resetPasswordToken;
    }
    console.log("findUser", query);

    return dbClient.db()
        .collection("users")
        .findOne(query, projection)
        .then(doc => {
            console.log("findUser mongo responded: ", doc);
            return doc;
        });
}

// Takes milliseconds and appends a random character to avoid sub-millisecond conflicts, e.g. 1dvfc3nt84
function generateTimeId() {
    return Date.now().toString(32) + Math.round(Math.random() * 35).toString(36);
}

function generateId (idLength = 10) {
    return generate('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', idLength);
}
