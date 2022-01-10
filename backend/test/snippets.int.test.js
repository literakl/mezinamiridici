const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(__dirname, '..', '.test.env');
dotenv.config({ path: envPath });

const mongo = require('../src/utils/mongo');
const { logger } = require('../src/utils/logging');
const app = require('../src/server');

const {
  api, getAuthHeader,
} = require('./testUtils');
const {
  setup, Leos, Jiri, Vita, Lukas,
} = require('./prepareUsers');

let dbClient, server;

test('Item snippets', async () => {
  await setup(dbClient, api);

  const itemBody = {
    title: 'First item',
    source: '<h1>Title</h1><p>Very smart topic</p>',
    picture: 'picture.png',
  };

  const blog = await api('articles', { method: 'POST', json: itemBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(blog.success).toBeTruthy();

  // get snippets as Jiri - forbidden (missing role staffer)
  let response = await api(`items/${blog.data._id}/snippets`, { method: 'GET', headers: getAuthHeader(Jiri.jwt) });
  expect(response.statusCode).toBe(403);

  // get snippets as Lukas - forbidden (different user than owner)
  response = await api(`items/${blog.data._id}/snippets`, { method: 'GET', headers: getAuthHeader(Lukas.jwt) });
  expect(response.statusCode).toBe(403);

  // get snippets as Vita - empty
  response = await api(`items/${blog.data._id}/snippets`, { method: 'GET', headers: getAuthHeader(Vita.jwt) }).json();
  expect(response.success).toBe(true);
  expect(response.data.length).toBe(0);

  const snippetABody = {
    code: 'set_a',
    type: 'html',
    content: '<javascript>a=1</javascript>',
    date: '2021-08-16T05:22:33.121Z',
  };

  // create snippet A as Jiri - forbidden (missing role editor in chief)
  response = await api(`items/${blog.data._id}/snippets`, { method: 'POST', json: snippetABody, headers: getAuthHeader(Jiri.jwt) });
  expect(response.statusCode).toBe(403);

  // create snippet A as Vita - forbidden (missing role editor in chief)
  response = await api(`items/${blog.data._id}/snippets`, { method: 'POST', json: snippetABody, headers: getAuthHeader(Vita.jwt) });
  expect(response.statusCode).toBe(403);

  // create snippet A as Leos
  response = await api(`items/${blog.data._id}/snippets`, { method: 'POST', json: snippetABody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBe(true);

  const snippetCBody = {
    code: 'set_c',
    type: 'html',
    content: '<javascript>c=1</javascript>',
    date: '2021-08-16T05:22:33.121Z',
  };

  // create snippet C as Leos
  response = await api(`items/${blog.data._id}/snippets`, { method: 'POST', json: snippetCBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();

  // get snippets - A,C as Vita
  response = await api(`items/${blog.data._id}/snippets`, { method: 'GET', headers: getAuthHeader(Vita.jwt) }).json();
  expect(response.success).toBe(true);
  expect(response.data.length).toBe(2);
  expect(response.data[0].code).toBe(snippetABody.code);
  expect(response.data[1].code).toBe(snippetCBody.code);

  response = await api(`content/${blog.data.info.slug}`).json();
  expect(response.success).toBe(true);
  expect(response.data.snippets.length).toBe(2);
  expect(response.data.snippets[0].code).toBe(snippetABody.code);
  expect(response.data.snippets[1].code).toBe(snippetCBody.code);

  // rename snippet C to B as Leos
  const snippetBBody = {
    code: 'set_b',
    type: 'HTML',
    content: '<javascript>b=1</javascript>',
    date: '2021-08-16T05:22:33.121Z',
  };
  response = await api(`items/${blog.data._id}/snippets/${snippetCBody.code}`, { method: 'PATCH', json: snippetBBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBe(true);
  expect(response.data.code).toBe(snippetBBody.code);
  expect(response.data.type).toBe(snippetBBody.type);
  expect(response.data.content).toBe(snippetBBody.content);

  const snippetDBody = {
    code: 'set_d',
    type: 'html',
    content: '<javascript>d=1</javascript>',
    date: '2021-08-16T05:22:33.121Z',
  };

  // add snippet D as Leos
  response = await api(`items/${blog.data._id}/snippets`, { method: 'POST', json: snippetDBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();

  // remove snippet A as Leos
  response = await api(`items/${blog.data._id}/snippets/${snippetABody.code}`, { method: 'DELETE', headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBe(true);

  // get snippets - B,D as Vita
  response = await api(`items/${blog.data._id}/snippets`, { method: 'GET', headers: getAuthHeader(Vita.jwt) }).json();
  expect(response.success).toBe(true);
  expect(response.data.length).toBe(2);
  expect(response.data[0].code).toBe(snippetBBody.code);
  expect(response.data[1].code).toBe(snippetDBody.code);
});

beforeEach(async () => {
  const db = dbClient.db();
  await db.collection('users').deleteMany({});
  await db.collection('items').deleteMany({});
  await db.collection('snippets').deleteMany({});
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
