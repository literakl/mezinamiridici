const generate = require('nanoid/generate');
const { MongoClient } = require('mongodb');
const dayjs = require('dayjs');

const { logger } = require('./logging');
require('./path_env');

const { MONGODB_URI, TIME_ID_CHARS } = process.env;
const { MONGO_TRACE = 'false' } = process.env;
const TIME_ID_CHARS_INT = parseInt(TIME_ID_CHARS || '1', 10);
logger.info(`Mongo is configured to connect ${MONGODB_URI}`); // TODO mask the password

let cachedDb;

function connectToDatabase() {
  if (!!cachedDb && !!cachedDb.topology && cachedDb.topology.isConnected()) {
    logger.debug('Using the cached Mongo instance');
    return Promise.resolve(cachedDb);
  }

  logger.debug('Get a new Mongo instance from database');
  const client = new MongoClient(MONGODB_URI);
  return client.connect()
    .then((db) => {
      logger.debug('Successful connect');
      cachedDb = db;

      if (MONGO_TRACE === 'true') {
        logger.info('mongo trace on');
        const events = ['serverOpening', 'serverClosed', 'serverDescriptionChanged', 'topologyOpening', 'topologyClosed', 'topologyDescriptionChanged', 'serverHeartbeatStarted', 'serverHeartbeatSucceeded', 'serverHeartbeatFailed'];
        for (let i = 0; i < events.length; i += 1) {
          const eventName = events[i];
          client.on(eventName, (event) => {
            logger.info(`received ${eventName}:\n${JSON.stringify(event, null, 2)}`);
          });
        }
      }

      return cachedDb;
    })
    .catch((err) => {
      logger.error('Connection error occurred: ', err);
      throw err;
    });
}

async function findOne(dbClient, collection, query) {
  const response = await dbClient.db().collection(collection).findOne(query);
  return response;
}

async function insertOne(dbClient, collection, doc) {
  const response = await dbClient.db().collection(collection).insertOne(doc);
  return response;
}

async function updateOne(dbClient, collection, filter, update) {
  const response = await dbClient.db().collection(collection).updateOne(update);
  return response;
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

  if (Object.keys(query).length === 0) {
    throw new Error('Empty query');
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

async function getContent(dbClient, slug, itemId) {
  let query;
  if (itemId) {
    query = { _id: itemId };
  }
  if (slug) {
    query = { 'info.slug': slug };
  }
  if (!query) {
    throw new Error('Both slug and id are empty');
  }

  const db = dbClient.db();
  const item = await db.collection('items').findOne(query);
  if (item && item.type !== 'blog') { // fetch snippets
    const projection = {
      projection: {
        code: 1,
        type: 1,
        content: 1,
      },
    };
    item.snippets = await db.collection('snippets')
      .find({ itemId: item._id }, projection)
      .toArray();
  }

  return item;
}

async function getPoll(dbClient, pipeline) {
  const cursor = dbClient.db().collection('items').aggregate(pipeline);
  const item = await cursor.next();
  if (item == null) {
    return null;
  }
  return processPoll(item);
}

function processPoll(item) {
  if (item.data.votes) {
    item.votes = item.data.votes;
    delete item.data.votes;
    item.votes.total = item.votes.neutral + item.votes.trivial + item.votes.dislike + item.votes.hate;
  }
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
    .find({ type, 'info.state': 'published', 'info.date': dateExpression }, { projection: { info: 1 } })
    .sort(sortExpression)
    .limit(1);
}

/*
  function parseMongoError(error) {
    // TODO createUser.js, separate keys
  }
*/

async function logAdminActions(dbClient, userId, action, itemId, extraData = {}) {
  await dbClient.db().collection('audit_log').insertOne({
    userId,
    action,
    itemId,
    date: new Date().toISOString(),
    ...extraData,
  });
}

// TODO remove and replace with mongo/mongo_setup.js
function setupIndexes(dbClient) {
  const db = dbClient.db();
  db.collection('users').createIndex({ 'auth.email': 1 }, { unique: true });
  db.collection('users').createIndex({ 'bio.nickname': 1 }, { unique: true });
  db.collection('items').createIndex({ 'info.type': 1 });
  db.collection('items').createIndex({ 'info.date': 1 });
  db.collection('items').createIndex({ 'info.state': 1 });
  db.collection('items').createIndex({ 'info.slug': 1 }, { unique: true });
  db.collection('poll_votes').createIndex({ itemId: 1, user: 1 }, { unique: true });
  db.collection('comments').createIndex({ itemId: 1 });
  db.collection('comments').createIndex({ parentId: 1 });
  db.collection('comment_votes').createIndex({ commentId: 1, 'user.id': 1 }, { unique: true });
  db.collection('link_shares').createIndex({ user: 1 });
  db.collection('link_shares').createIndex({ date: 1 });
  db.collection('updates').createIndex({ item: 1 });
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

function spent(start) {
  return dayjs().diff(start);
}

function storePictureId(dbClient, itemId, pictureIds) {
  if (pictureIds) {
    const query = { $set: { item: itemId } };
    pictureIds.forEach((item) => {
      dbClient.db()
        .collection('uploads')
        .updateOne({ _id: item }, query);
    });
  }
}

const stageSortByDateDesc = { $sort: { 'info.date': -1 } };
const stagePublishedPoll = { $match: { 'info.state': 'published', type: 'poll', 'info.date': { $lte: new Date() } } };
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
                { itemId: pollId },
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
              { $expr: { $eq: ['$itemId', '$$poll_id'] } },
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

// https://github.com/vkarpov15/mongo-sanitize
function sanitize(v) {
  if (v instanceof Object) {
    for (const key in v) {
      if (/^\$/.test(key)) {
        delete v[key];
      } else {
        sanitize(v[key]);
      }
    }
  }
  return v;
}

exports.connectToDatabase = connectToDatabase;
exports.close = close;
exports.findOne = findOne;
exports.findUser = findUser;
exports.insertOne = insertOne;
exports.updateOne = updateOne;
exports.getIdentity = getIdentity;
exports.getPoll = getPoll;
exports.getContent = getContent;
exports.processPoll = processPoll;
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
exports.setupIndexes = setupIndexes;
exports.incrementUserActivityCounter = incrementUserActivityCounter;
exports.generateId = generateId;
exports.generateTimeId = generateTimeId;
exports.logAdminActions = logAdminActions;
exports.storePictureId = storePictureId;
exports.sanitize = sanitize;
