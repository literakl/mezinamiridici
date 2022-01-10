const dotenv = require('dotenv');
const dayjs = require('dayjs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.test.env');
dotenv.config({ path: envPath });

const mongo = require('../src/utils/mongo');
const { logger } = require('../src/utils/logging');
const app = require('../src/server');

const {
  api, bff, getAuthHeader, FULL_DATE_FORMAT,
} = require('./testUtils');
const {
  setup, Leos, Jiri, Vita, Lukas, Bara, Jana,
} = require('./prepareUsers');

let dbClient, server;

test('Blog', async () => {
  await setup(dbClient, api);

  const blogBody = {
    title: 'First blog',
    source: '<h1>Title</h1><p>Very smart topic</p>',
    picture: 'picture.png',
  };

  let blog = await api('posts', { method: 'POST', json: blogBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(blog.success).toBeTruthy();
  expect(blog.data.info.caption).toBe(blogBody.title);
  blogBody.title = 'First blog post';
  blog = await api(`posts/${blog.data._id}`, { method: 'PATCH', json: blogBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(blog.success).toBeTruthy();
  expect(blog.data.info.caption).toBe(blogBody.title);

  const blog2 = await api('posts', { method: 'POST', json: blogBody, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(blog2.success).toBeTruthy();

  let comments = await bff(`items/${blog.data._id}/comments`).json();
  expect(comments.success).toBeTruthy();
  expect(comments.data.comments.length).toBe(0);
  const commentBody = {
    source: '<h3>This is Header.</h3><p>This is test paragraph.</p>',
    date: dayjs(blog.data.info.date).add(10, 'minute').format(FULL_DATE_FORMAT),
  };
  const comment1 = await api(`items/${blog.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(comment1.success).toBeTruthy();

  const voteBody = { vote: 1 };
  let response = await api(`comments/${comment1.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(response.success).toBeTruthy();
  comments = await bff(`items/${blog.data._id}/comments`).json();
  expect(comments.success).toBeTruthy();
  expect(comments.data.comments.length).toBe(1);

  // delete by anonymous user
  response = await api(`posts/${blog.data._id}`, { method: 'DELETE' }).json();
  expect(response.success).toBeFalsy();
  // delete by different user
  response = await api(`posts/${blog.data._id}`, { method: 'DELETE', headers: getAuthHeader(Bara.jwt) }).json();
  expect(response.success).toBeFalsy();
  // delete by author
  response = await api(`posts/${blog.data._id}`, { method: 'DELETE', headers: getAuthHeader(Vita.jwt) }).json();
  expect(response.success).toBeTruthy();

  // check blog is gone
  response = await api(`content/${blog.data.data.slug}`).json();
  expect(response.success).toBeFalsy();
  // check comments are gone
  const db = dbClient.db();
  const comment = await db.collection('comments').findOne({ itemId: blog.data._id });
  expect(comment).toBeFalsy();
  const vote = await db.collection('comment_votes').findOne({ itemId: blog.data._id });
  expect(vote).toBeFalsy();
  // check upload is gone
  const upload = await db.collection('uploads').findOne({ itemId: blog.data._id });
  expect(upload).toBeFalsy();

  // delete post as admin
  blog = await api('posts', { method: 'POST', json: blogBody, headers: getAuthHeader(Vita.jwt) }).json();
  response = await api(`posts/${blog.data._id}`, { method: 'DELETE', headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  // cannot delete deleted post
  response = await api(`posts/${blog.data._id}`, { method: 'DELETE', headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeFalsy();
});

test('Tag API', async () => {
  await setup(dbClient, api);

  const blogBody = {
    title: 'First blog',
    source: '<h1>Title</h1><p>Very smart topic</p>',
    picture: 'picture.png',
    tags: ['motorky'],
  };

  const blogA = await api('posts', { method: 'POST', json: blogBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(blogA.success).toBeTruthy();
  blogBody.title = 'Second blog';
  blogBody.source = '<p>Offtopic topic</p>';
  blogBody.tags.push('auta');
  const blogB = await api('posts', { method: 'POST', json: blogBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(blogB.success).toBeTruthy();

  let taggedItems = await bff('items/motorky').json();
  expect(taggedItems.success).toBeTruthy();
  expect(taggedItems.data.length).toBe(2);

  taggedItems = await bff('items/auta').json();
  expect(taggedItems.success).toBeTruthy();
  expect(taggedItems.data.length).toBe(1);
  expect(taggedItems.data[0]._id).toBe(blogB.data._id);
  expect(taggedItems.data[0].data.content).toBeUndefined();
});

test('Hide Posts', async () => {
  await setup(dbClient, api);

  const blogBody = {
    title: 'First blog',
    source: '<h1>Title</h1><p>Very smart topic</p>',
    picture: 'picture.png',
  };

  const blog = await api('posts', { method: 'POST', json: blogBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(blog.success).toBeTruthy();
  const body = {
    flag: true,
  };

  let response = await api(`posts/${blog.data._id}/hidden`, { method: 'PATCH', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  response = await api(`content/${blog.data.info.slug}`).json();
  expect(response.data.info.state).toBe('hidden');

  body.flag = false;
  response = await api(`posts/${blog.data._id}/hidden`, { method: 'PATCH', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  response = await api(`content/${blog.data.info.slug}`).json();
  expect(response.data.info.state).toBe('published');
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
