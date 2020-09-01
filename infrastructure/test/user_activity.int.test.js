const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(__dirname, '..', '.test.env');
dotenv.config({ path: envPath });

const mongo = require('../src/utils/mongo.js');
const logger = require('../src/utils/logging');
const app = require('../src/server.js');
const {
  api, bff, getAuthHeader,
} = require('./testUtils');
const {
  setup, Leos, Lukas, Jana,
} = require('./prepareUsers');

let server;
let dbClient;

test('User activity API', async (done) => {
  jest.setTimeout(180000);

  // create first poll
  const firstPoll = {
    text: 'First question',
    picture: 'picture.png',
  };
  let response = await api('polls', { method: 'POST', json: firstPoll, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  firstPoll.id = response.data._id;

  // create second poll
  const secondPoll = {
    text: 'Second question',
    picture: 'picture.png',
    author: Jana._id,
  };
  response = await api('polls', { method: 'POST', json: secondPoll, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  secondPoll.id = response.data._id;

  // vote in both polls
  let body = { vote: 'neutral' };
  response = await bff(`polls/${firstPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  body = { vote: 'hate' };
  response = await bff(`polls/${secondPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();

  // create two comments, different users
  const commentBody = { text: 'Comment 1' };
  const comment1 = await api(`items/${firstPoll.id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(comment1.success).toBeTruthy();
  commentBody.text = 'Comment 2';
  const comment2 = await api(`items/${secondPoll.id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(comment2.success).toBeTruthy();

  // vote for the comment
  const voteBody = { vote: 1 };
  const voteResponse = await api(`comments/${comment2.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();

  // todo write blog

  response = await api(`users/${Leos._id}/activity`).json();
  console.log(response);
  expect(response.success).toBeTruthy();
  expect(response.data.length).toBe(4);
  expect(response.data[0].userId).toBe(Leos._id);
  expect(response.data[0].itemId).toBe(firstPoll.id);
  expect(response.data[0].action).toBe('vote');
  expect(response.data[0].info.caption).toBe(firstPoll.text);
  expect(response.data[1].itemId).toBe(secondPoll.id);
  expect(response.data[1].action).toBe('vote');
  expect(response.data[1].info.caption).toBe(secondPoll.text);
  expect(response.data[2].itemId).toBe(firstPoll.id);
  expect(response.data[2].info.caption).toBe(firstPoll.text);
  expect(response.data[2].action).toBe('comment');
  expect(response.data[2].commentId).toBe(comment1.data.comment._id);
  expect(response.data[3].itemId).toBe(secondPoll.id);
  expect(response.data[3].info.caption).toBe(secondPoll.text);
  expect(response.data[3].action).toBe('vote');
  expect(response.data[3].commentId).toBe(comment2.data.comment._id);

  done();
});

beforeEach(async () => {
  await dbClient.db().collection('items').deleteMany({});
  await dbClient.db().collection('polls').deleteMany({});
  await dbClient.db().collection('poll_votes').deleteMany({});
  await dbClient.db().collection('user_activity').deleteMany({});
});

beforeAll(async () => {
  server = app.listen(3000, () => logger.info('Server started'));
  dbClient = await mongo.connectToDatabase();
  await setup(dbClient, api);
});

afterAll(() => {
  mongo.close();
  server.close();
  logger.info('Server stopped');
});
