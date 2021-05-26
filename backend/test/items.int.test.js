const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(__dirname, '..', '.test.env');
dotenv.config({ path: envPath });

const mongo = require('../src/utils/mongo.js');
const { logger } = require('../src/utils/logging');
const app = require('../src/server.js');

const {
  api, bff, getAuthHeader,
} = require('./testUtils');
const {
  setup, Leos, Jiri, Vita,
} = require('./prepareUsers');

let dbClient, server;

test('Delete Blog', async (done) => {
  await setup(dbClient, api);
  jest.setTimeout(180 * 60000);

  const blogBody = {
    title: 'First blog',
    source: '<h1>Title</h1><p>Very smart topic</p>',
    picture: 'picture.png',
  };

  let blog = await api('blog', { method: 'POST', json: blogBody, headers: getAuthHeader(Vita.jwt) }).json();

  // delete by anonymous user
  let response = await api(`blog/${blog.data._id}`, { method: 'DELETE' }).json();
  expect(response.success).toBeFalsy();
  // delete by different user
  response = await api(`blog/${blog.data._id}`, { method: 'DELETE', headers: getAuthHeader(Jiri.jwt) }).json();
  expect(response.success).toBeFalsy();
  // delete by author
  response = await api(`blog/${blog.data._id}`, { method: 'DELETE', headers: getAuthHeader(Vita.jwt) }).json();
  expect(response.success).toBeTruthy();

  blog = await api('blog', { method: 'POST', json: blogBody, headers: getAuthHeader(Vita.jwt) }).json();
  response = await api(`blog/${blog.data._id}`, { method: 'DELETE', headers: getAuthHeader(Leos.jwt) }).json();
  // delete as admin
  expect(response.success).toBeTruthy();
  // delete deleted
  response = await api(`blog/${blog.data._id}`, { method: 'DELETE', headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeFalsy();

  done();
});

beforeEach(async () => {
  const db = dbClient.db();
  await db.collection('users').deleteMany({});
  await db.collection('items').deleteMany({});
  await db.collection('comments').deleteMany({});
  await db.collection('comment_votes').deleteMany({});
  await db.collection('uploads').deleteMany({});
});

beforeAll(async () => {
  dbClient = await mongo.connectToDatabase();
  server = app.listen(3000, () => logger.info('Server started'));
});

afterAll(() => {
  mongo.close();
  server.close();
  logger.info('Server stopped');
});
