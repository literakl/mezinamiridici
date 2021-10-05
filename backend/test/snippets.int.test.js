const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(__dirname, '..', '.test.env');
dotenv.config({ path: envPath });

const mongo = require('../src/utils/mongo.js');
const { logger } = require('../src/utils/logging');
const app = require('../src/server.js');

const {
  api, getAuthHeader,
} = require('./testUtils');
const {
  setup, Leos, Jiri, Vita, Lukas
} = require('./prepareUsers');

let dbClient, server;

test('Item snippets', async (done) => {
  await setup(dbClient, api);
  jest.setTimeout(180 * 60000);

    const blogBody = {
      title: 'First blog',
      source: '<h1>Title</h1><p>Very smart topic</p>',
      picture: 'picture.png',
    };

    let blog = await api('posts', { method: 'POST', json: blogBody, headers: getAuthHeader(Vita.jwt) }).json();
    expect(blog.success).toBeTruthy();

    response = await api(`posts/${blog.data._id}/snippets`, { method: 'GET', headers: getAuthHeader(Jiri.jwt)}).json();
    expect(response.success).toBe(false)
    expect(response.errors[0].message).toBe('Access denied');

    // response = await api(`posts/${blog.data._id}/snippets`, { method: 'GET', headers: getAuthHeader(Lukas.jwt)}).json();
    // expect(response.success).toBe(false)
    // expect(response.errors[0].message).toBe('Access denied');

    response = await api(`posts/${blog.data._id}/snippets`, { method: 'GET', headers: getAuthHeader(Vita.jwt)}).json();
    expect(response.success).toBe(true)
    expect(response.data.length).toBe(0);

    const snippetABody = {
      code: 'set_x',
      type: 'html',
      content: '<javascript>x=1</javascript>',
      date: '2021-08-16T05:22:33.121Z',
    };

    response = await api(`posts/${blog.data._id}/snippets`, { method: 'POST', json: snippetABody, headers: getAuthHeader(Jiri.jwt)}).json();
    expect(response.success).toBe(false);
    expect(response.errors[0].message).toBe('Access denied');

    response = await api(`posts/${blog.data._id}/snippets`, { method: 'POST', json: snippetABody, headers: getAuthHeader(Vita.jwt)}).json();
    expect(response.success).toBe(false);
    expect(response.errors[0].message).toBe('Access denied');

    response = await api(`posts/${blog.data._id}/snippets`, { method: 'POST', json: snippetABody, headers: getAuthHeader(Leos.jwt)}).json();
    expect(response.success).toBe(true);

    const snippetCBody = {
      code: 'set_x',
      type: 'html',
      content: '<javascript>x=1</javascript>',
      date: '2021-08-16T05:22:33.121Z',
    };

    response = await api(`posts/${blog.data._id}/snippets`, { method: 'POST', json: snippetCBody, headers: getAuthHeader(Leos.jwt)}).json();
    expect(response.success).toBeTruthy();

    response = await api(`posts/${blog.data._id}/snippets`, { method: 'GET', headers: getAuthHeader(Vita.jwt)}).json();
    expect(response.success).toBe(true)
    expect(response.data.length).toBe(2);
  
   response = await api(`posts/${blog.data._id}/snippets/set_Y`, { method: 'PATCH', headers: getAuthHeader(Leos.jwt)}).json();
   expect(response.success).toBe(true);
   expect(response.data.value.code).toBe('set_x');

   const snippetDBody = {
    code: 'set_F',
    type: 'html',
    content: '<javascript>x=1</javascript>',
    date: '2021-08-16T05:22:33.121Z',
  };

  response = await api(`posts/${blog.data._id}/snippets`, { method: 'POST', json: snippetDBody, headers: getAuthHeader(Leos.jwt)}).json();
  expect(response.success).toBeTruthy();
  

  response = await api(`posts/${blog.data._id}/snippets/set_x`, { method: 'DELETE', headers: getAuthHeader(Leos.jwt)}).json();
  expect(response.success).toBe(true);

  response = await api(`posts/${blog.data._id}/snippets`, { method: 'GET', headers: getAuthHeader(Vita.jwt)}).json();
  expect(response.success).toBe(true);
  expect(response.data.length).toBe(2);


  /*
  1. create blog as Vita
  2. get snippets as Jiri - forbidden (missing role staffer)
  2. get snippets as Lukas - forbidden (different user than owner)
  2. get snippets as Vita - empty
  3. create snippet A as Jiri - forbidden (missing role editor in chief)
  3. create snippet A as Vita - forbidden (missing role editor in chief)
  3. create snippet A as Leos
  4. create snippet C as Leos
  5. get snippets - A,C as Vita
  6. rename snippet C to B as Leos
  7. add snippet D as Leos
  8. remove snippet A as Leos
  9. get snippets - B,D as Vita
  */

  done();
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
