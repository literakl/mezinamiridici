 
const dotenv = require('dotenv');
const path = require('path');
const dayjs = require('dayjs');

const envPath = path.join(__dirname, '..', '.test.env');
dotenv.config({ path: envPath });

const mongo = require('../src/utils/mongo.js');
const { logger } = require('../src/utils/logging');
const app = require('../src/server.js');

const {
  api, bff, getAuthHeader
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
    source: { date: new Date().getTime(), blocks: [], version: '2.18.0' },
    picture: 'picture.png',
    tags: ['tag', 'another tag'],
  };

  const blogToDeleteByAuthor = await api('blog', { method: 'POST', json: blogBody, headers: getAuthHeader(Jiri.jwt) }).json();
  const deleteByAuthorResponse = await api(`blog/${blogToDeleteByAuthor.data._id}`, { method: 'DELETE', headers: getAuthHeader(Jiri.jwt) }).json();
  expect(deleteByAuthorResponse.success).toBeTruthy();

  const blogToDeleteByAdmin = await api('blog', { method: 'POST', json: blogBody, headers: getAuthHeader(Jiri.jwt) }).json();
  const deleteByAdminResponse = await api(`blog/${blogToDeleteByAdmin.data._id}`, { method: 'DELETE', headers: getAuthHeader(Leos.jwt) }).json();
  expect(deleteByAdminResponse.success).toBeTruthy();

  const blogToDeleteByNonAuthUser = await api('blog', { method: 'POST', json: blogBody, headers: getAuthHeader(Leos.jwt) }).json();
  const deleteByNonAuthUserResponse = await api(`blog/${blogToDeleteByNonAuthUser.data._id}`, { method: 'DELETE', headers: getAuthHeader(Jiri.jwt) }).json();
  expect(deleteByNonAuthUserResponse.success).toBeFalsy();

  done();
});

beforeEach(async () => {
  const db = dbClient.db();
  await db.collection('users').deleteMany({});
  await db.collection('items').deleteMany({});
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