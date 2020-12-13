const generate = require('nanoid/generate');
const { MongoClient } = require('mongodb');

const { logger } = require('./logging');
require('./path_env');

const { MONGODB_URI, TIME_ID_CHARS } = process.env;
const TIME_ID_CHARS_INT = parseInt(TIME_ID_CHARS || '1', 10);
logger.info(`Mongo is configured to connect ${MONGODB_URI}`);
let cachedDb = null;

const stageSortByDateDesc = { $sort: { 'info.date': -1 } };
const stagePublishedPoll = { $match: { 'info.published': true, type: 'poll' } };
function stageLimit(n) { return { $limit: n }; }
function stageId(id) { return { $match: { _id: id } }; }
function stageSlug(slug) { return { $match: { 'info.slug': slug } }; }
function stageTag(tag) { return { 'info.tags': { $in: [tag] } }; }
function stageMyPollVote(userId, pollId) {
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
function stageCommentVotes() {
  return {
    $lookup: {
      from: 'comment_votes',
      localField: '_id',
      foreignField: 'commentId',
      as: 'votes',
    },
  };
}
function stageReduceCommentData() {
  return {
    $project: {
      itemId: 0,
      source: 0,
      'votes._id': 0,
      'votes.commentId': 0,
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

  return MongoClient.connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
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
  if (params.nickname) {
    query['bio.nickname'] = params.nickname;
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

// counterpart for authenticate.getIdentity()
function getIdentity(dbClient, userId) {
  const query = { _id: userId };
  return dbClient.db()
    .collection('users')
    .findOne(query, { projection: { 'bio.nickname': 1 } })
    .then(user => ((user === null) ? null : { userId: user._id, nickname: user.bio.nickname }));
}

async function incrementUserActivityCounter(dbClient, userId, type, action) {
  let update;
  if (type === 'comment') {
    if (action === 'vote') {
      update = { $inc: { 'honors.count.commentVotes': 1 } };
    } else {
      update = { $inc: { 'honors.count.comments': 1 } };
    }
  } else if (type === 'poll') {
    update = { $inc: { 'honors.count.pollVotes': 1 } };
  } else if (type === 'share') {
    update = { $inc: { 'honors.count.shares': 1 } };
  } else if (type === 'blog') {
    update = { $inc: { 'honors.count.blogs': 1 } };
  }
  return dbClient.db().collection('users').updateOne({ _id: userId }, update);
}

async function getBlog(dbClient, slug, blogId) {
  if (blogId) {
    return dbClient.db().collection('items').findOne({ _id: blogId });
  }
  if (slug) {
    return dbClient.db().collection('items').findOne({ 'info.slug': slug });
  }
  throw new Error('Both slug and id are empty');
}

async function getPoll(dbClient, pipeline) {
  const cursor = dbClient.db().collection('items').aggregate(pipeline);
  const item = await cursor.next();
  if (item == null) {
    return null;
  }
  return processPoll(item);
}

async function getPage(dbClient, pipeline) {
  const cursor = dbClient.db().collection('items').aggregate(pipeline);
  return cursor.next();
}

function processPoll(item) {
  item.votes = item.data.votes;
  delete item.data.votes;
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

// TODO remove and replace with mongo/mongo_setup.js
function setupIndexes(dbClient) {
  const db = dbClient.db();
  db.collection('users').createIndex({ 'auth.email': 1 }, { unique: true });
  db.collection('users').createIndex({ 'bio.nickname': 1 }, { unique: true });
  db.collection('items').createIndex({ 'info.type': 1 });
  db.collection('items').createIndex({ 'info.date': 1 });
  db.collection('items').createIndex({ 'info.slug': 1 }, { unique: true });
  db.collection('poll_votes').createIndex({ item: 1, user: 1 }, { unique: true });
  db.collection('comments').createIndex({ itemId: 1 });
  db.collection('comments').createIndex({ parentId: 1 });
  db.collection('comment_votes').createIndex({ commentId: 1, 'user.id': 1 }, { unique: true });
  db.collection('link_shares').createIndex({ user: 1 });
  db.collection('link_shares').createIndex({ date: 1 });
}

// Takes milliseconds and appends a random character to avoid sub-millisecond conflicts, e.g. 1dvfc3nt84
// Use TIME_ID_CHARS to fine tune number of random characters
function generateTimeId() {
  let id = Date.now().toString(32);
  for (let i = 0; i < TIME_ID_CHARS_INT; i += 1) {
    id += Math.round(Math.random() * 35).toString(36);
  }
  return id;
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
exports.getBlog = getBlog;
exports.processPoll = processPoll;
exports.getPage = getPage;
exports.getNeighbourhItem = getNeighbourhItem;
exports.stageSortByDateDesc = stageSortByDateDesc;
exports.stageLimit = stageLimit;
exports.stageMyPollVote = stageMyPollVote;
exports.stageReduceCommentData = stageReduceCommentData;
exports.stageCommentVotes = stageCommentVotes;
exports.stagePublishedPoll = stagePublishedPoll;
exports.stageSlug = stageSlug;
exports.stageId = stageId;
exports.stageTag = stageTag;
exports.close = close;
exports.setupIndexes = setupIndexes;
exports.incrementUserActivityCounter = incrementUserActivityCounter;
