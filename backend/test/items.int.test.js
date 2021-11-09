
const dotenv = require('dotenv');
const dayjs = require('dayjs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.test.env');
dotenv.config({ path: envPath });

const mongo = require('../src/utils/mongo.js');
const { logger } = require('../src/utils/logging');
const app = require('../src/server.js');

const {
  api, bff, getAuthHeader, FULL_DATE_FORMAT,
} = require('./testUtils');
const {
  setup, Leos, Jiri, Vita, Lukas, Bara, Jana,
} = require('./prepareUsers');

let dbClient, server;

test('Blog', async (done) => {
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
  response = await api(`posts/${blog.data.data.slug}`).json();
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

  // editor staff actions

  // create new article as author
  const articleBody = {
    title: 'First articel',
    source: '<h1>Title</h1><p>Smart article</p>',
    picture: 'picture.png',
    editorial: true,
  };
  let firstArticle = await api('posts', { method: 'POST', json: articleBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(firstArticle.success).toBeTruthy();
  expect(firstArticle.data.info.editorial).toBeTruthy();
  expect(firstArticle.data.info.published).toBeFalsy();

  // edit post as author before publishing
  articleBody.source = '<h1>Title</h1><p>Very smart article</p>';
  firstArticle = await api(`posts/${firstArticle.data._id}`, { method: 'PATCH', json: articleBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(firstArticle.success).toBeTruthy();

  // edit as editor in chief
  articleBody.title = 'First article';
  articleBody.source = '<h1>Title</h1><p>Very smart edited article</p>';
  firstArticle = await api(`posts/${firstArticle.data._id}`, { method: 'PATCH', json: articleBody, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(firstArticle.success).toBeTruthy();

  firstArticle = await api(`posts/${firstArticle.data.info.slug}`).json();
  expect(firstArticle.success).toBeTruthy();
  expect(firstArticle.data.info.caption).toBe(articleBody.title);
  expect(firstArticle.data.data.content).toBe(articleBody.source);

  // prepare another article for later use
  articleBody.title = 'Second article';
  articleBody.source = '<h1>Title</h1><p>Editor in chief article</p>';
  const secondArticle = await api('posts', { method: 'POST', json: articleBody, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(secondArticle.success).toBeTruthy();

  // publish article as editor
  const flagBody = { flag: true };
  response = await api(`posts/${firstArticle.data._id}/published`, { method: 'PATCH', json: flagBody, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(response.success).toBeTruthy();

  // author cannot edit published article anymore
  articleBody.title = 'Spam article';
  response = await api(`posts/${firstArticle.data._id}`, { method: 'PATCH', json: articleBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(response.success).toBeFalsy();

  // author cannot delete published article anymore
  response = await api(`posts/${firstArticle.data._id}`, { method: 'DELETE', headers: getAuthHeader(Vita.jwt) }).json();
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
  response = await api(`posts/${firstArticle.data._id}`, { method: 'DELETE', headers: getAuthHeader(Jiri.jwt) }).json();
  expect(response.success).toBeFalsy();
  // delete post as editor
  response = await api(`posts/${firstArticle.data._id}`, { method: 'DELETE', headers: getAuthHeader(Lukas.jwt) }).json();
  expect(response.success).toBeTruthy();
  // cannot delete deleted post
  response = await api(`posts/${firstArticle.data._id}`, { method: 'DELETE', headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeFalsy();

  done();
});

test('Tag API', async (done) => {
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

  done();
});

test('Hide Posts', async (done) => {
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
  response = await api(`posts/${blog.data.info.slug}`).json();
  expect(response.data.info.hidden).toBe(true);

  body.flag = false;
  response = await api(`posts/${blog.data._id}/hidden`, { method: 'PATCH', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  response = await api(`posts/${blog.data.info.slug}`).json();
  expect(response.data.info.hidden).toBe(false);

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
