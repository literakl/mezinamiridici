const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');

dotenv.config({ path: 'C:\\dev\\mezinamiridici\\infrastructure\\.test.env' });
const random = require('random');
const mongo = require('../src/utils/mongo.js');
const logger = require('../src/utils/logging');
const app = require('../src/server.js');
const {
  api, getAuthHeader,
} = require('./testUtils');
const {
  leos, jiri, lukas, vita, jana, bara,
} = require('./prepareUsers');

let jwtVita, jwtLeos, jwtJiri, jwtLukas, jwtJana, jwtBara;
// eslint-disable-next-line no-unused-vars
let userVita, userLeos, userJiri, userLukas, userJana, userBara;
let server;
let dbClient;

test('Comments test', async (done) => {
  jest.setTimeout(180 * 60000);
  random.use();

  const pollBody = {
    text: 'First question',
    picture: 'picture.png',
    date: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
  };
  const firstPoll = await api('polls', { method: 'POST', json: pollBody, headers: getAuthHeader(jwtLeos) }).json();
  expect(firstPoll.success).toBeTruthy();

  const commentBody = {
    commentText: 'Comment 1',
    date: dayjs(firstPoll.data.info.published).add(10, 'minute').format('YYYY-MM-DD HH:mm:ss'),
  };
  const firstPollComment1 = await api(`polls/${firstPoll.id}/comment`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtLeos) }).json();
  expect(firstPollComment1.success).toBeTruthy();

  commentBody.commentText = 'Comment 2';
  commentBody.date = dayjs(firstPoll.data.info.published).add(20, 'minute').format('YYYY-MM-DD HH:mm:ss');
  const firstPollComment2 = await api(`polls/${firstPoll.id}/comment`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtLukas) }).json();
  expect(firstPollComment2.success).toBeTruthy();

  commentBody.commentText = 'Comment 3';
  commentBody.date = dayjs(firstPoll.data.info.published).add(30, 'minute').format('YYYY-MM-DD HH:mm:ss');
  const firstPollComment3 = await api(`polls/${firstPoll.id}/comment`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtBara) }).json();
  expect(firstPollComment3.success).toBeTruthy();

  commentBody.commentText = 'Comment 4';
  commentBody.date = dayjs(firstPoll.data.info.published).add(40, 'minute').format('YYYY-MM-DD HH:mm:ss');
  const firstPollComment4 = await api(`polls/${firstPoll.id}/comment`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtJana) }).json();
  expect(firstPollComment4.success).toBeTruthy();

  commentBody.commentText = 'Comment 5';
  commentBody.date = dayjs(firstPoll.data.info.published).add(50, 'minute').format('YYYY-MM-DD HH:mm:ss');
  const firstPollComment5 = await api(`polls/${firstPoll.id}/comment`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtJiri) }).json();
  expect(firstPollComment5.success).toBeTruthy();

  commentBody.commentText = 'Comment 6';
  commentBody.date = dayjs(firstPoll.data.info.published).add(60, 'minute').format('YYYY-MM-DD HH:mm:ss');
  const firstPollComment6 = await api(`polls/${firstPoll.id}/comment`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtVita) }).json();
  expect(firstPollComment6.success).toBeTruthy();

  done();
});

beforeEach(async () => {
  await dbClient.db().collection('items').deleteMany({});
  await dbClient.db().collection('comments').deleteMany({});
  await dbClient.db().collection('comment_votes').deleteMany({});
});

beforeAll(async () => {
  server = app.listen(3000, () => logger.info('Server started'));

  dbClient = await mongo.connectToDatabase();
  await dbClient.db().collection('users').deleteMany({});
  await dbClient.db().collection('users').insertMany([leos, jiri, lukas, vita, jana, bara]);

  const body = {
    email: 'vita@email.bud',
    password: 'BadPassword',
  };

  let response = await api('authorizeUser', { method: 'POST', json: body }).json();
  jwtVita = response.data;
  userVita = jwt.decode(response.data);

  body.email = 'leos@email.bud';
  response = await api('authorizeUser', { method: 'POST', json: body }).json();
  jwtLeos = response.data;
  userLeos = jwt.decode(response.data);

  body.email = 'jiri@email.bud';
  response = await api('authorizeUser', { method: 'POST', json: body }).json();
  jwtJiri = response.data;
  userJiri = jwt.decode(response.data);

  body.email = 'lukas@email.bud';
  response = await api('authorizeUser', { method: 'POST', json: body }).json();
  jwtLukas = response.data;
  userLukas = jwt.decode(response.data);

  body.email = 'jana@email.bud';
  response = await api('authorizeUser', { method: 'POST', json: body }).json();
  jwtJana = response.data;
  userJana = jwt.decode(response.data);

  body.email = 'bara@email.bud';
  response = await api('authorizeUser', { method: 'POST', json: body }).json();
  jwtBara = response.data;
  userBara = jwt.decode(response.data);
});

afterAll(() => {
  mongo.close();
  server.close();
  logger.info('Server stopped');
});
