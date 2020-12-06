const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(__dirname, '..', '.test.env');
dotenv.config({ path: envPath });

const mongo = require('../src/utils/mongo.js');
const { logger } = require('../src/utils/logging');
const app = require('../src/server.js');
const {
  api, getAuthHeader, resetHonors,
} = require('./testUtils');
const {
  setup, Leos, Lukas, Jana,
} = require('./prepareUsers');

let server;
let dbClient;

test('User activity API', async (done) => {
  jest.setTimeout(180000);

  // create first poll
  const poll1 = {
    text: 'First question',
    picture: 'picture.png',
  };
  let response = await api('polls', { method: 'POST', json: poll1, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  poll1.id = response.data._id;
  poll1.published = true;
  response = await api(`polls/${poll1.id}`, { method: 'PATCH', json: poll1, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  poll1.author = Leos._id;

  // create second poll
  const poll2 = {
    text: 'Second question',
    picture: 'picture.png',
  };
  response = await api('polls', { method: 'POST', json: poll2, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  poll2.id = response.data._id;
  poll2.published = true;
  response = await api(`polls/${poll2.id}`, { method: 'PATCH', json: poll2, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();

  // create third poll, not published
  const poll3 = {
    text: 'Third question',
    picture: 'picture.png',
  };
  response = await api('polls', { method: 'POST', json: poll3, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  poll3.id = response.data._id;

  // create fourth poll, published, but different user
  const poll4 = {
    text: 'Fourth question',
    picture: 'picture.png',
    author: Jana._id,
  };
  response = await api('polls', { method: 'POST', json: poll4, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  poll4.id = response.data._id;
  poll4.published = true;
  response = await api(`polls/${poll4.id}`, { method: 'PATCH', json: poll4, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();

  // create two comments, different users
  const commentBody = { source: '<h3>This is Header.</h3><p>This is test paragraph.</p>' };
  response = await api(`items/${poll1.id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  const comment1 = response.data;

  commentBody.text = 'Comment 2';
  response = await api(`items/${poll2.id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(response.success).toBeTruthy();
  // const comment2 = response.data;

  commentBody.text = 'Comment 2';
  response = await api(`items/${poll4.id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  const comment3 = response.data;

  // todo write blog

  response = await api(`users/${Leos._id}/activity?type=poll`).json();
  expect(response.success).toBeTruthy();
  expect(response.data.length).toBe(2);
  expect(response.data[0]._id).toBe(poll1.id);
  expect(response.data[0].text).toBe(poll1.text);
  expect(response.data[1]._id).toBe(poll2.id);
  expect(response.data[1].text).toBe(poll2.text);

  response = await api(`users/${Leos._id}/activity?type=comment`).json();
  expect(response.success).toBeTruthy();
  expect(response.data.length).toBe(2);
  expect(response.data[0]._id).toBe(comment3.comment._id);
  expect(response.data[0].userId).toBe(poll4.author);
  expect(response.data[0].slug).toBe('fourth-question');
  expect(response.data[1]._id).toBe(comment1.comment._id);
  expect(response.data[1].userId).toBe(poll1.author);
  expect(response.data[1].slug).toBe('first-question');
  expect(response.data[1].text).toBe('This is Header.\n\nThis is test paragraph.');

  done();
});

beforeEach(async () => {
  await dbClient.db().collection('items').deleteMany({});
  await dbClient.db().collection('polls').deleteMany({});
  await dbClient.db().collection('comments').deleteMany({});
});

beforeAll(async () => {
  server = app.listen(3000, () => logger.info('Server started'));
  dbClient = await mongo.connectToDatabase();
  await setup(dbClient, api);
  await resetHonors(dbClient);
});

afterAll(() => {
  mongo.close();
  server.close();
  logger.info('Server stopped');
});
