const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

const envPath = path.join(__dirname, '..', '.test.env');
dotenv.config({ path: envPath });

const mongo = require('../src/utils/mongo.js');
const logger = require('../src/utils/logging');
const app = require('../src/server.js');
const {
  api, bff, getAuthHeader,
} = require('./testUtils');
const {
  leos, jiri, lukas, vita, jana, bara,
} = require('./prepareUsers');

let jwtVita, jwtLeos, jwtJiri, jwtLukas, jwtJana, jwtBara;
// eslint-disable-next-line no-unused-vars
let userVita, userLeos, userJiri, userLukas, userJana, userBara;
let server;
let dbClient;

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

test('Comments API', async (done) => {
  jest.setTimeout(180 * 60000);

  const pollBody = {
    text: 'First question',
    picture: 'picture.png',
    date: dayjs().subtract(7, 'hour').format('YYYY-MM-DD'),
  };
  const poll = await api('polls', { method: 'POST', json: pollBody, headers: getAuthHeader(jwtLeos) }).json();
  expect(poll.success).toBeTruthy();

  const commentBody = {
    commentText: 'Comment 1',
    date: dayjs(poll.data.info.date).add(10, 'minute').format(DATE_FORMAT),
  };
  const pollComment1 = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtLeos) }).json();
  expect(pollComment1.success).toBeTruthy();

  const voteBody = {
    vote: 1,
  };
  let voteResponse = await api(`comments/${pollComment1.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtLeos) }).json();
  expect(voteResponse.success).toBeFalsy();
  voteResponse = await api(`comments/${pollComment1.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtJiri) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteResponse = await api(`comments/${pollComment1.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtVita) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteResponse = await api(`comments/${pollComment1.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtLukas) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteBody.vote = -1;
  voteResponse = await api(`comments/${pollComment1.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtBara) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteResponse = await api(`comments/${pollComment1.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtJana) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteResponse = await api(`comments/${pollComment1.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtJana) }).json();
  expect(voteResponse.success).toBeFalsy();

  let pollResponse = await bff(`polls/${poll.data.info.slug}`).json();
  expect(pollResponse.data.comments.count).toBe(1);
  expect(dayjs.utc(pollResponse.data.comments.last, DATE_FORMAT).local().format(DATE_FORMAT)).toBe(commentBody.date);

  let comments = await bff(`items/${poll.data._id}/comments`).json();
  expect(comments.success).toBeTruthy();
  console.log(comments.data);

  voteResponse = await bff(`comments/${pollComment1.data._id}/votes`).json();
  expect(voteResponse.success).toBeTruthy();
  expect(voteResponse.data.length).toBe(5);

  commentBody.commentText = 'Comment 2';
  commentBody.date = dayjs(poll.data.info.date).add(20, 'minute').format(DATE_FORMAT);
  const pollComment2 = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtLukas) }).json();
  expect(pollComment2.success).toBeTruthy();

  pollResponse = await bff(`polls/${poll.data.info.slug}`).json();
  expect(pollResponse.data.comments.count).toBe(2);
  expect(dayjs.utc(pollResponse.data.comments.last, DATE_FORMAT).local().format(DATE_FORMAT)).toBe(commentBody.date);

  voteBody.vote = -1;
  voteResponse = await api(`comments/${pollComment2.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtLeos) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteResponse = await api(`comments/${pollComment2.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtVita) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteBody.vote = 1;
  voteResponse = await api(`comments/${pollComment2.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtJiri) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteResponse = await api(`comments/${pollComment2.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtJana) }).json();
  expect(voteResponse.success).toBeTruthy();

  voteResponse = await bff(`comments/${pollComment2.data._id}/votes`).json();
  expect(voteResponse.success).toBeTruthy();
  expect(voteResponse.data.length).toBe(4);

  commentBody.commentText = 'Comment 3';
  commentBody.date = dayjs(poll.data.info.date).add(30, 'minute').format(DATE_FORMAT);
  const pollComment3 = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtBara) }).json();
  expect(pollComment3.success).toBeTruthy();

  voteResponse = await api(`comments/${pollComment3.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtLeos) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteResponse = await api(`comments/${pollComment3.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtJana) }).json();
  expect(voteResponse.success).toBeTruthy();

  voteResponse = await bff(`comments/${pollComment3.data._id}/votes`).json();
  expect(voteResponse.success).toBeTruthy();
  expect(voteResponse.data.length).toBe(2);

  commentBody.commentText = 'Comment 4';
  commentBody.date = dayjs(poll.data.info.date).add(40, 'minute').format(DATE_FORMAT);
  const pollComment4 = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtJana) }).json();
  expect(pollComment4.success).toBeTruthy();

  commentBody.commentText = 'Comment 5';
  commentBody.date = dayjs(poll.data.info.date).add(50, 'minute').format(DATE_FORMAT);
  const pollComment5 = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtJiri) }).json();
  expect(pollComment5.success).toBeTruthy();

  voteBody.vote = -1;
  voteResponse = await api(`comments/${pollComment5.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtVita) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteResponse = await api(`comments/${pollComment5.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtLeos) }).json();
  expect(voteResponse.success).toBeTruthy();

  voteResponse = await bff(`comments/${pollComment5.data._id}/votes`).json();
  expect(voteResponse.success).toBeTruthy();
  expect(voteResponse.data.length).toBe(2);

  commentBody.commentText = 'Comment 6';
  commentBody.date = dayjs(poll.data.info.date).add(60, 'minute').format(DATE_FORMAT);
  const pollComment6 = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtVita) }).json();
  expect(pollComment6.success).toBeTruthy();

  voteResponse = await bff(`comments/${pollComment6.data._id}/votes`).json();
  expect(voteResponse.success).toBeTruthy();
  expect(voteResponse.data.length).toBe(0);

  commentBody.commentText = 'Comment 1a';
  commentBody.parentId = pollComment1.data._id;
  commentBody.date = dayjs(pollComment1.data.created).add(1, 'minute').format(DATE_FORMAT);
  const pollComment1a = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtLukas) }).json();
  expect(pollComment1a.success).toBeTruthy();

  voteBody.vote = 1;
  voteResponse = await api(`comments/${pollComment1a.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtJiri) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteBody.vote = -1;
  voteResponse = await api(`comments/${pollComment1a.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtVita) }).json();
  expect(voteResponse.success).toBeTruthy();

  voteResponse = await bff(`comments/${pollComment1a.data._id}/votes`).json();
  expect(voteResponse.success).toBeTruthy();
  expect(voteResponse.data.length).toBe(2);

  commentBody.commentText = 'Comment 1b';
  commentBody.parentId = pollComment1.data._id;
  commentBody.date = dayjs(pollComment1.data.created).add(2, 'minute').format(DATE_FORMAT);
  const pollComment1b = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtVita) }).json();
  expect(pollComment1b.success).toBeTruthy();

  voteBody.vote = 1;
  voteResponse = await api(`comments/${pollComment1b.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtLukas) }).json();
  expect(voteResponse.success).toBeTruthy();

  voteResponse = await bff(`comments/${pollComment1b.data._id}/votes`).json();
  expect(voteResponse.success).toBeTruthy();
  expect(voteResponse.data.length).toBe(1);

  commentBody.commentText = 'Comment 1c';
  commentBody.parentId = pollComment1.data._id;
  commentBody.date = dayjs(pollComment1.data.created).add(3, 'minute').format(DATE_FORMAT);
  const pollComment1c = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtLukas) }).json();
  expect(pollComment1c.success).toBeTruthy();

  commentBody.commentText = 'Comment 1d';
  commentBody.parentId = pollComment1.data._id;
  commentBody.date = dayjs(pollComment1.data.created).add(4, 'minute').format(DATE_FORMAT);
  const pollComment1d = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtJiri) }).json();
  expect(pollComment1d.success).toBeTruthy();

  voteResponse = await api(`comments/${pollComment1d.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtLukas) }).json();
  expect(voteResponse.success).toBeTruthy();

  commentBody.commentText = 'Comment 1e';
  commentBody.parentId = pollComment1.data._id;
  commentBody.date = dayjs(pollComment1.data.created).add(5, 'minute').format(DATE_FORMAT);
  const pollComment1e = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtJana) }).json();
  expect(pollComment1e.success).toBeTruthy();

  voteBody.vote = -1;
  voteResponse = await api(`comments/${pollComment1e.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtBara) }).json();
  expect(voteResponse.success).toBeTruthy();

  commentBody.commentText = 'Comment 1f';
  commentBody.parentId = pollComment1.data._id;
  commentBody.date = dayjs(pollComment1.data.created).add(6, 'minute').format(DATE_FORMAT);
  const pollComment1f = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtBara) }).json();
  expect(pollComment1f.success).toBeTruthy();

  commentBody.commentText = 'Comment 2a';
  commentBody.parentId = pollComment2.data._id;
  commentBody.date = dayjs(pollComment2.data.created).add(1, 'hour').format(DATE_FORMAT);
  const pollComment2a = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtLeos) }).json();
  expect(pollComment2a.success).toBeTruthy();

  voteBody.vote = 1;
  voteResponse = await api(`comments/${pollComment2a.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtBara) }).json();
  expect(voteResponse.success).toBeTruthy();

  commentBody.commentText = 'Comment 2b';
  commentBody.parentId = pollComment2.data._id;
  commentBody.date = dayjs(pollComment2.data.created).add(2, 'hour').format(DATE_FORMAT);
  const pollComment2b = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtVita) }).json();
  expect(pollComment2b.success).toBeTruthy();

  commentBody.commentText = 'Comment 2c';
  commentBody.parentId = pollComment2.data._id;
  commentBody.date = dayjs(pollComment2.data.created).add(3, 'hour').format(DATE_FORMAT);
  const pollComment2c = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtJiri) }).json();
  expect(pollComment2c.success).toBeTruthy();

  voteBody.vote = -1;
  voteResponse = await api(`comments/${pollComment2c.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtBara) }).json();
  expect(voteResponse.success).toBeTruthy();

  commentBody.commentText = 'Comment 2d';
  commentBody.parentId = pollComment2.data._id;
  commentBody.date = dayjs(pollComment2.data.created).add(4, 'hour').format(DATE_FORMAT);
  const pollComment2d = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtBara) }).json();
  expect(pollComment2d.success).toBeTruthy();

  commentBody.commentText = 'Comment 4a';
  commentBody.parentId = pollComment4.data._id;
  commentBody.date = dayjs(pollComment4.data.created).add(5, 'minute').format(DATE_FORMAT);
  const pollComment4a = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtBara) }).json();
  expect(pollComment4a.success).toBeTruthy();

  commentBody.commentText = 'Comment 4b';
  commentBody.parentId = pollComment4.data._id;
  commentBody.date = dayjs(pollComment4.data.created).add(10, 'minute').format(DATE_FORMAT);
  const pollComment4b = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtJana) }).json();
  expect(pollComment4b.success).toBeTruthy();

  commentBody.commentText = 'Comment 4c';
  commentBody.parentId = pollComment4.data._id;
  commentBody.date = dayjs(pollComment4.data.created).add(15, 'minute').format(DATE_FORMAT);
  const pollComment4c = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtBara) }).json();
  expect(pollComment4c.success).toBeTruthy();

  voteBody.vote = 1;
  voteResponse = await api(`comments/${pollComment4c.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(jwtJana) }).json();
  expect(voteResponse.success).toBeTruthy();

  commentBody.commentText = 'Comment 4d';
  commentBody.parentId = pollComment4.data._id;
  commentBody.date = dayjs(pollComment4.data.created).add(20, 'minute').format(DATE_FORMAT);
  const pollComment4d = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtJana) }).json();
  expect(pollComment4d.success).toBeTruthy();

  commentBody.commentText = 'Comment 4e';
  commentBody.parentId = pollComment4.data._id;
  commentBody.date = dayjs(pollComment4.data.created).add(25, 'minute').format(DATE_FORMAT);
  const pollComment4e = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtJana) }).json();
  expect(pollComment4e.success).toBeTruthy();

  commentBody.commentText = 'Comment 4f';
  commentBody.parentId = pollComment4.data._id;
  commentBody.date = dayjs(pollComment4.data.created).add(40, 'minute').format(DATE_FORMAT);
  const pollComment4f = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtBara) }).json();
  expect(pollComment4f.success).toBeTruthy();

  commentBody.commentText = 'Comment 4g';
  commentBody.parentId = pollComment4.data._id;
  commentBody.date = dayjs(pollComment4.data.created).add(40, 'minute').format(DATE_FORMAT);
  const pollComment4g = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtJana) }).json();
  expect(pollComment4g.success).toBeTruthy();

  commentBody.commentText = 'Comment 4h';
  commentBody.parentId = pollComment4.data._id;
  commentBody.date = dayjs(pollComment4.data.created).add(45, 'minute').format(DATE_FORMAT);
  const pollComment4h = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtBara) }).json();
  expect(pollComment4h.success).toBeTruthy();

  commentBody.commentText = 'Comment 4i';
  commentBody.parentId = pollComment4.data._id;
  commentBody.date = dayjs(pollComment4.data.created).add(40, 'minute').format(DATE_FORMAT);
  const pollComment4i = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtJana) }).json();
  expect(pollComment4i.success).toBeTruthy();

  commentBody.commentText = 'Comment 6a';
  commentBody.parentId = pollComment6.data._id;
  commentBody.date = dayjs(pollComment6.data.created).add(3, 'minute').format(DATE_FORMAT);
  const pollComment6a = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtJiri) }).json();
  expect(pollComment6a.success).toBeTruthy();

  commentBody.commentText = 'Comment 6b';
  commentBody.parentId = pollComment6.data._id;
  commentBody.date = dayjs(pollComment6.data.created).add(6, 'minute').format(DATE_FORMAT);
  const pollComment6b = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(jwtLeos) }).json();
  expect(pollComment6b.success).toBeTruthy();

  comments = await bff(`items/${poll.data._id}/comments`).json();
  expect(comments.success).toBeTruthy();
  console.log(comments);

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
