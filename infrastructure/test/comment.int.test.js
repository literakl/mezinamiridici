const dotenv = require('dotenv');

dotenv.config({ path: 'C:\\dev\\mezinamiridici\\infrastructure\\.test.env' });
const random = require('random');
const mongo = require('../src/utils/mongo.js');
const logger = require('../src/utils/logging');
const app = require('../src/server.js');
const {
  api, bff, getAuthHeader, deepCopy, sleep,
} = require('./testUtils');
const {
  leos, jiri, lukas, vita, jana, bara,
} = require('./prepareUsers');

let server;
let dbClient;

test.skip('Single comment stress test', async (done) => {
  jest.setTimeout(20 * 60000);
  // random.use();

  const users = [leos, jiri, lukas, vita, jana, bara];
  const items = [];
  for (let i = 1; i <= 100; i += 1) {
    const pollId = mongo.generateId(10);
    await dbClient.db().collection('items').insertOne({ _id: pollId, info: { caption: `Item ${i}` } });
    items.push(pollId);
  }
  const comments = [];
  for (let i = 1; i <= 1000000; i += 1) {
    if (i % 1000 === 0) {
      console.log(i);
    }
    let itemId, path, author = users[random.int(users.length - 1)];
    const commentId = mongo.generateId(10);
    if (comments.length === 0 || random.float() < 0.3) {
      itemId = items[random.int(items.length - 1)];
      path = itemId;
    } else {
      const thread = comments[random.int(comments.length - 1)];
      itemId = thread.itemId;
      let threadPath = thread.path;
      const depth = (threadPath.match(/\//g) || []).length;
      if (depth >= 5) {
        threadPath = threadPath.substring(0, threadPath.lastIndexOf('/'));
      }
      path = `${threadPath}/${commentId}`;
    }
    const comment = {
      _id: commentId,
      item: itemId,
      path,
      date: new Date(),
      author: author.bio.nickname,
      text: `thread ${path}, author ${author.bio.nickname}`,
      plus_votes: generateVoters(),
      minus_votes: generateVoters(),
    };
    await dbClient.db().collection('comments').insertOne(comment);
    items.push(itemId);
    comments.push({ path, itemId });
  }

  done();
});

function generateVoters() {
  const users = [];
  const max = random.int(users.length);
  for (let x = 0; x < max; x += 1) {
    users.push(users[random.int(users.length)]);
  }
  return users;
}

beforeEach(async () => {
  await dbClient.db().collection('items').deleteMany({});
  await dbClient.db().collection('comments').deleteMany({});
});

beforeAll(async () => {
  // server = app.listen(3000, () => logger.info("Server started"));

  dbClient = await mongo.connectToDatabase();
  await dbClient.db().collection('users').deleteMany({});
  await dbClient.db().collection('users').insertMany([leos, jiri, lukas, vita, jana, bara]);
});

afterAll(() => {
  mongo.close();
  // server.close();
  logger.info('Server stopped');
});
