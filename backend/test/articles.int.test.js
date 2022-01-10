const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(__dirname, '..', '.test.env');
dotenv.config({ path: envPath });

const mongo = require('../src/utils/mongo');
const { logger } = require('../src/utils/logging');
const app = require('../src/server');

const {
  api, bff, getAuthHeader,
} = require('./testUtils');
const {
  setup, Leos, Jiri, Vita, Lukas, Jana,
} = require('./prepareUsers');

let dbClient, server;

test('Articles', async () => {
  await setup(dbClient, api);

  // create new article as author
  const articleBody = {
    title: 'First articel',
    source: '<h1>Title</h1><p>Smart article</p>',
    picture: 'picture.png',
  };
  let firstArticle = await api('articles', { method: 'POST', json: articleBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(firstArticle.success).toBeTruthy();
  expect(firstArticle.data.info.state).toBe('draft');

  // edit post as author before publishing
  articleBody.source = '<h1>Title</h1><p>Very smart article</p>';
  firstArticle = await api(`articles/${firstArticle.data._id}`, { method: 'PATCH', json: articleBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(firstArticle.success).toBeTruthy();

  // edit as editor in chief
  articleBody.title = 'First article';
  articleBody.source = '<h1>Title</h1><p>Very smart edited article</p>';
  firstArticle = await api(`articles/${firstArticle.data._id}`, { method: 'PATCH', json: articleBody, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(firstArticle.success).toBeTruthy();

  firstArticle = await api(`content/${firstArticle.data.info.slug}`).json();
  expect(firstArticle.success).toBeTruthy();
  expect(firstArticle.data.info.caption).toBe(articleBody.title);
  expect(firstArticle.data.data.content).toBe(articleBody.source);

  // prepare another article for later use
  articleBody.title = 'Second article';
  articleBody.source = '<h1>Title</h1><p>Editor in chief article</p>';
  const secondArticle = await api('articles', { method: 'POST', json: articleBody, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(secondArticle.success).toBeTruthy();

  // publish article as editor
  const flagBody = { flag: true };
  let response = await api(`articles/${firstArticle.data._id}/published`, { method: 'PATCH', json: flagBody, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(response.success).toBeTruthy();

  // author cannot edit published article anymore
  articleBody.title = 'Spam article';
  response = await api(`articles/${firstArticle.data._id}`, { method: 'PATCH', json: articleBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(response.success).toBeFalsy();

  // author cannot delete published article anymore
  response = await api(`articles/${firstArticle.data._id}`, { method: 'DELETE', headers: getAuthHeader(Vita.jwt) }).json();
  expect(response.success).toBeFalsy();

  // anonymous user does not see a list of articles
  let articles = await bff('articles');
  expect(articles.success).toBeFalsy();
  // only editor and staff can see the list of articles
  articles = await bff('articles', { method: 'GET', headers: getAuthHeader(Jana.jwt) }).json();
  expect(articles.success).toBeFalsy();
  // authors can see the list of their articles
  articles = await bff('articles', { method: 'GET', headers: getAuthHeader(Vita.jwt) }).json();
  expect(articles.success).toBeTruthy();
  expect(articles.data.length).toBe(1);
  expect(articles.data[0]._id).toBe(firstArticle.data._id);
  // editor can see the list of all articles
  articles = await bff('articles', { method: 'GET', headers: getAuthHeader(Lukas.jwt) }).json();
  expect(articles.success).toBeTruthy();
  expect(articles.data.length).toBe(2);
  expect(articles.data[0]._id).toBe(secondArticle.data._id);
  expect(articles.data[1]._id).toBe(firstArticle.data._id);

  // cannot delete post as firstArticle admin
  response = await api(`articles/${firstArticle.data._id}`, { method: 'DELETE', headers: getAuthHeader(Jiri.jwt) }).json();
  expect(response.success).toBeFalsy();
  // delete post as editor
  response = await api(`articles/${firstArticle.data._id}`, { method: 'DELETE', headers: getAuthHeader(Lukas.jwt) }).json();
  expect(response.success).toBeTruthy();
  // cannot delete deleted post
  response = await api(`articles/${firstArticle.data._id}`, { method: 'DELETE', headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeFalsy();
});

test('Publish articles', async () => {
  await setup(dbClient, api);

  const theBody = {
    title: 'First article',
    source: '<h1>Title</h1><p>Very smart topic</p>',
    picture: 'picture.png',
  };

  const blog = await api('articles', { method: 'POST', json: theBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(blog.success).toBeTruthy();
  const body = {
    flag: true,
  };

  let response = await api(`articles/${blog.data._id}/published`, { method: 'PATCH', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  response = await api(`content/${blog.data.info.slug}`).json();
  expect(response.data.info.state).toBe('published');

  body.flag = false;
  response = await api(`articles/${blog.data._id}/published`, { method: 'PATCH', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  response = await api(`content/${blog.data.info.slug}`).json();
  expect(response.data.info.state).toBe('draft');
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
