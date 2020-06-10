const path = require('path');
const generate = require('nanoid/generate');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const logger = require('./logging');

var envPath = path.join(__dirname,'../..','.env')
dotenv.config({ path:envPath });
let MONGODB_URI = process.env.MONGODB_URI;
logger.info("Mongo is configured to connect " + MONGODB_URI);
let cachedDb = null;

const stageSortByDateDesc = { $sort: { 'info.date': -1 } };
const stagePublished = { $match: { 'info.published': true } };
function stageLimit(n) { return { $limit: n }; }
function stageId(id) { return { $match: { _id: id } }; }
function stageSlug(slug) { return { $match: { 'info.slug': slug } }; }
function stageMyVote(userId, pollId) {
  if (pollId) {
    return {
      $lookup: {
        from: 'poll_votes',
        pipeline: [
          {
            $match: {
              $and: [
                { item: pollId },
                { user: userId },
              ],
            },
          },
          { $project: { _id: 0, vote: '$vote' } },
        ],
        as: 'me',
      },
    };
  }
  return {
    $lookup: {
      from: 'poll_votes',
      let: { poll_id: '$_id' },
      pipeline: [
        {
          $match: {
            $and: [
              { $expr: { $eq: ['$item', '$$poll_id'] } },
              { user: userId },
            ],
          },
        },
        { $project: { _id: 0, vote: '$vote' } },
      ],
      as: 'me',
    },
  };
}

// TODO overit caching a uzavirani client https://mongodb.github.io/node-mongodb-native/3.5/quick-start/quick-start/
function connectToDatabase() {
  logger.debug('Connect to mongo database');

  if (!!cachedDb && !!cachedDb.topology && cachedDb.topology.isConnected()) {
    logger.debug('Using cached database instance');
    return Promise.resolve(cachedDb);
  }

  return MongoClient.connect(MONGODB_URI)
    .then((db) => {
      logger.debug('Successful connect');
      cachedDb = db;
      return cachedDb;
    })
    .catch((err) => {
      logger.error('Connection error occurred: ', err);
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
    .collection('users')
    .findOne(query, projection)
    .then(doc => doc);
}

function getIdentity(dbClient, userId) {
  const query = { _id: userId };
  return dbClient.db()
    .collection('users')
    .findOne(query, { projection: { 'bio.nickname': 1 } })
    .then(user => ((user === null) ? null : { userId: user._id, nickname: user.bio.nickname }));
}

async function getPoll(dbClient, pipeline) {
  const cursor = dbClient.db().collection('items').aggregate(pipeline);
  const item = await cursor.next();
  if (item == null) {
    return null;
  }
  item.votes = item.data.votes;
  item.votes.total = item.votes.neutral + item.votes.trivial + item.votes.dislike + item.votes.hate;
  if (item.me && item.me[0]) {
    item.my_vote = item.me[0].vote;
  }
  delete item.me;
  return item;
}

function getNeighbourhItem(dbClient, type, published, older) {
  let dateExpression, sortExpression;
  if (older) {
    dateExpression = { $lt: published };
    sortExpression = { 'info.date': -1 };
  } else {
    dateExpression = { $gt: published };
    sortExpression = { 'info.date': 1 };
  }
  return dbClient.db().collection('items')
    .find({ type, 'info.published': true, 'info.date': dateExpression }, { projection: { info: 1 } })
    .sort(sortExpression)
    .limit(1);
}

// Takes milliseconds and appends a random character to avoid sub-millisecond conflicts, e.g. 1dvfc3nt84
function generateTimeId() {
  return Date.now().toString(32) + Math.round(Math.random() * 35).toString(36);
}

function generateId(idLength = 10) {
  return generate('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', idLength);
}

function close() {
  if (cachedDb) {
    logger.info('Closing the cached mongo client');
    cachedDb.close();
  }
}

exports.connectToDatabase = connectToDatabase;
exports.generateId = generateId;
exports.generateTimeId = generateTimeId;
exports.findUser = findUser;
exports.getIdentity = getIdentity;
exports.getPoll = getPoll;
exports.getNeighbourhItem = getNeighbourhItem;
exports.stageSortByDateDesc = stageSortByDateDesc;
exports.stageLimit = stageLimit;
exports.stageMyVote = stageMyVote;
exports.stagePublished = stagePublished;
exports.stageSlug = stageSlug;
exports.stageId = stageId;
exports.close = close;
