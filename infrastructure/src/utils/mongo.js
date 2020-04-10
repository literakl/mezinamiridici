const generate = require('nanoid/generate');
const dotenv = require('dotenv');
const MongoClient = require('mongodb').MongoClient;

dotenv.config();
let MONGODB_URI = process.env.MONGODB_URI;
let cachedDb = null;

const stageSortByDateDesc = {$sort: {"info.date": -1}};
const stagePublished = {$match: {"info.published": true}};
function stageLimit (n) { return { $limit: n } }
function stageId (id) { return {$match: {_id: id}} }
function stageSlug (slug) { return {$match: {"info.slug": slug}} }
const stageLookupPoll = {
    $lookup: {
        from: 'polls',
        localField: '_id',
        foreignField: '_id',
        as: 'poll'
    }
};
function stageMyVote(userId, pollId) {
    if (pollId) {
        return {
            $lookup: {
                from: 'poll_votes', pipeline: [
                    {$match: {poll: pollId, user: userId}},
                    {$project: {_id: 0, vote: "$vote"}},
                ],
                as: "me"
            }
        }
    }
    return {
        $lookup: {
            from: 'poll_votes',
            let: {poll_id: "$_id"},
            pipeline: [
                {$match: {poll: "$$poll_id", user: userId}},
                {$project: {_id: 0, vote: "$vote"}},
            ],
            as: "me"
        }
    }
}

// TODO overit caching a uzavirani client https://mongodb.github.io/node-mongodb-native/3.5/quick-start/quick-start/
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

    return dbClient.db()
        .collection("users")
        .findOne(query, projection)
        .then(doc => {
            // console.log("findUser mongo responded: ", doc);
            return doc;
        });
}

async function getPoll(dbClient, pipeline) {
    const cursor = dbClient.db().collection("items").aggregate(pipeline);
    const item = await cursor.next();
    item.votes = item.poll[0].votes;
    item.votes.total = item.votes.neutral + item.votes.trivial + item.votes.dislike + item.votes.hate;
    delete item.poll;
    if (item.me[0]) {
        item.my_vote = item.me[0].vote;
    }
    delete item.me;
    return item;
}

// Takes milliseconds and appends a random character to avoid sub-millisecond conflicts, e.g. 1dvfc3nt84
function generateTimeId() {
    return Date.now().toString(32) + Math.round(Math.random() * 35).toString(36);
}

function generateId (idLength = 10) {
    return generate('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', idLength);
}

exports.connectToDatabase = connectToDatabase;
exports.generateId = generateId;
exports.generateTimeId = generateTimeId;
exports.findUser = findUser;
exports.getPoll = getPoll;
exports.stageSortByDateDesc = stageSortByDateDesc;
exports.stageLimit = stageLimit;
exports.stageLookupPoll = stageLookupPoll;
exports.stageMyVote = stageMyVote;
exports.stagePublished = stagePublished;
exports.stageSlug = stageSlug;
exports.stageId = stageId;
