const dotenv = require('dotenv');
const path = require('path');
const dayjs = require('dayjs');

const envPath = path.join(__dirname, '..', '.test.env');
dotenv.config({ path: envPath });

const mongo = require('../src/utils/mongo');
const { logger } = require('../src/utils/logging');
const app = require('../src/server');
const {
  api, getAuthHeader, FULL_DATE_FORMAT, SHORT_DATE_FORMAT,
} = require('./testUtils');
const {
  setup, Leos, Lukas, Jana, Vita, Jiri, Bara,
} = require('./prepareUsers');

let server;
let dbClient;

test('Stream API', async () => {
  const futurePoll = {
    text: 'Third question',
    picture: 'images/stream/image.jpg',
  };
  let response = await api('polls', { method: 'POST', json: futurePoll, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  futurePoll.id = response.data._id;
  futurePoll.slug = response.data.info.slug;

  futurePoll.published = true;
  futurePoll.date = dayjs().add(1, 'day').format(SHORT_DATE_FORMAT);
  response = await api(`polls/${futurePoll.id}`, { method: 'PATCH', json: futurePoll, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();

  const ABlog = {
    title: 'Today blog',
    source: '<h1>Title</h1>',
    picture: 'images/stream/image.jpg',
    date: new Date(),
  };
  response = await api('posts', { method: 'POST', json: ABlog, headers: getAuthHeader(Bara.jwt) }).json();
  expect(response.success).toBeTruthy();
  ABlog.id = response.data._id;
  ABlog.slug = response.data.info.slug;

  const BBlog = {
    title: '1 day ago blog',
    source: '<h1>Title</h1>',
    picture: 'images/stream/picture.png',
    date: dayjs().subtract(1, 'day').format(FULL_DATE_FORMAT),
  };
  response = await api('posts', { method: 'POST', json: BBlog, headers: getAuthHeader(Jana.jwt) }).json();
  expect(response.success).toBeTruthy();
  BBlog.id = response.data._id;
  BBlog.slug = response.data.info.slug;

  const CPoll = {
    text: '2 days ago poll',
    picture: 'images/stream/picture.png',
    author: Jiri._id,
  };
  response = await api('polls', { method: 'POST', json: CPoll, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  CPoll.id = response.data._id;
  CPoll.slug = response.data.info.slug;

  CPoll.published = true;
  CPoll.date = dayjs().subtract(2, 'day').format(SHORT_DATE_FORMAT);
  response = await api(`polls/${CPoll.id}`, { method: 'PATCH', json: CPoll, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();

  const DBlog = {
    title: '3 days ago blog',
    source: '<h1>Title</h1>',
    picture: 'images/stream/default.jpg',
    date: dayjs().subtract(3, 'day').format(FULL_DATE_FORMAT),
  };
  response = await api('posts', { method: 'POST', json: DBlog, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  DBlog.id = response.data._id;
  DBlog.slug = response.data.info.slug;

  const EBlog = {
    title: '4 days ago blog',
    source: '<h1>Title</h1>',
    picture: 'images/stream/default.jpg',
    date: dayjs().subtract(4, 'day').format(FULL_DATE_FORMAT),
  };
  response = await api('posts', { method: 'POST', json: EBlog, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(response.success).toBeTruthy();
  EBlog.id = response.data._id;
  EBlog.slug = response.data.info.slug;

  const FPoll = {
    text: '5 days ago poll',
    picture: '/images/stream/default.jpg',
    author: Vita._id,
  };
  response = await api('polls', { method: 'POST', json: FPoll, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  FPoll.id = response.data._id;
  FPoll.slug = response.data.info.slug;

  FPoll.published = true;
  FPoll.date = dayjs().subtract(5, 'day').format(SHORT_DATE_FORMAT);
  response = await api(`polls/${FPoll.id}`, { method: 'PATCH', json: FPoll, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();

  const GBlog = {
    title: '6 days ago blog',
    source: '<h1>Title</h1>',
    picture: 'images/stream/default.jpg',
    date: dayjs().subtract(6, 'day').format(FULL_DATE_FORMAT),
  };
  response = await api('posts', { method: 'POST', json: GBlog, headers: getAuthHeader(Bara.jwt) }).json();
  expect(response.success).toBeTruthy();
  GBlog.id = response.data._id;
  GBlog.slug = response.data.info.slug;

  const HBlog = {
    title: '7 days ago blog',
    source: '<h1>Title</h1>',
    picture: 'images/stream/default.jpg',
    date: dayjs().subtract(7, 'day').format(FULL_DATE_FORMAT),
  };
  response = await api('posts', { method: 'POST', json: HBlog, headers: getAuthHeader(Jana.jwt) }).json();
  expect(response.success).toBeTruthy();
  HBlog.id = response.data._id;
  HBlog.slug = response.data.info.slug;

  const IBlog = {
    title: '8 days ago blog',
    source: '<h1>Title</h1>',
    picture: 'images/stream/default.jpg',
    date: dayjs().subtract(8, 'day').format(FULL_DATE_FORMAT),
  };
  response = await api('posts', { method: 'POST', json: IBlog, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(response.success).toBeTruthy();
  IBlog.id = response.data._id;
  IBlog.slug = response.data.info.slug;

  response = await api('item-stream?start=0&ps=10').json();
  expect(response.success).toBeTruthy();
  expect(response.data.length).toBe(9);
  expect(response.data[0]._id).toBe(ABlog.id);
  expect(response.data[0].info.caption).toBe(ABlog.title);
  expect(response.data[0].info.picture).toBe(ABlog.picture);
  expect(response.data[1]._id).toBe(BBlog.id);
  expect(response.data[2]._id).toBe(CPoll.id);
  expect(response.data[3]._id).toBe(DBlog.id);
  expect(response.data[4]._id).toBe(EBlog.id);
  expect(response.data[5]._id).toBe(FPoll.id);
  expect(response.data[6]._id).toBe(GBlog.id);
  expect(response.data[7]._id).toBe(HBlog.id);
  expect(response.data[8]._id).toBe(IBlog.id);
});

beforeEach(async () => {
  await dbClient.db().collection('items').deleteMany({});
  await dbClient.db().collection('polls').deleteMany({});
  await dbClient.db().collection('poll_votes').deleteMany({});
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
