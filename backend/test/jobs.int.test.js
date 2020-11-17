const dotenv = require('dotenv');
const path = require('path');
const dayjs = require('dayjs');

const envPath = path.join(__dirname, '..', '.test.env');
dotenv.config({ path: envPath });

const mongo = require('../src/utils/mongo.js');
const { logger } = require('../src/utils/logging');
const app = require('../src/server.js');

const {
  api, bff, getAuthHeader, getUserRank, resetHonors,
} = require('./testUtils');
const {
  setup, Leos, Jiri, Vita,
} = require('./prepareUsers');

const FULL_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss', SHORT_DATE_FORMAT = 'YYYY-MM-DD';
const { calculateUserHonors, calculateConsecutiveSharing } = require('../src/jobs/calculateUserRanks');

let dbClient, server;

test('User Rank', async (done) => {
  jest.setTimeout(180 * 60000);
  await setup(dbClient, api);
  await resetHonors(dbClient);

  const pollBody = {
    text: 'First question',
    picture: 'picture.png',
    date: dayjs().subtract(11, 'week').format(SHORT_DATE_FORMAT),
  };
  const poll1 = await api('polls', { method: 'POST', json: pollBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(poll1.success).toBeTruthy();

  const commentBody = {
    source: {
      time: 1599551274438,
      version: '2.18.0',
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: 'This is test paragraph.',
          },
        },
        {
          type: 'header',
          data: {
            text: 'This is Header.',
            level: 3,
          },
        },
      ],
    },
    date: dayjs(poll1.data.info.date).add(10, 'minute').format(FULL_DATE_FORMAT),
  };
  const comment1 = await api(`items/${poll1.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(comment1.success).toBeTruthy();

  const voteBody = {
    vote: 1,
  };
  let voteResponse = await api(`comments/${comment1.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteResponse = await api(`comments/${comment1.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();

  commentBody.text = 'Comment 2';
  const comment2 = await api(`items/${poll1.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(comment2.success).toBeTruthy();

  voteResponse = await api(`comments/${comment2.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();

  voteResponse = await bff(`polls/${poll1.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();

  const shareBody = {
    path: `/anketa/${poll1.data.info.slug}`,
    service: 'twitter',
    userId: Leos._id,
    date: dayjs().subtract(10, 'week').format(FULL_DATE_FORMAT),
  };

  let shareResponse = await api(`items/${poll1.data._id}/share`, { method: 'POST', json: shareBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(shareResponse.success).toBeTruthy();

  await calculateUserHonors();
  let rank = await getUserRank(dbClient, Leos._id);
  expect(rank).toBe('novice');

  voteResponse = await bff(`polls/${poll1.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();

  await calculateUserHonors();
  rank = await getUserRank(dbClient, Leos._id);
  expect(rank).toBe('student');

  for (let i = 9; i >= 0;) {
    shareBody.date = dayjs().subtract(i, 'week').format(FULL_DATE_FORMAT);
    // eslint-disable-next-line no-await-in-loop
    shareResponse = await api(`items/${poll1.data._id}/share`, { method: 'POST', json: shareBody, headers: getAuthHeader(Leos.jwt) }).json();
    expect(shareResponse.success).toBeTruthy();
    i -= 1;
  }

  pollBody.text = 'Second poll';
  pollBody.date = dayjs().subtract(6, 'week').format(SHORT_DATE_FORMAT);
  const poll2 = await api('polls', { method: 'POST', json: pollBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(poll2.success).toBeTruthy();

  voteResponse = await bff(`polls/${poll2.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();

  pollBody.text = 'Third poll';
  pollBody.date = dayjs().subtract(6, 'week').format(SHORT_DATE_FORMAT);
  const poll3 = await api('polls', { method: 'POST', json: pollBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(poll3.success).toBeTruthy();

  voteResponse = await bff(`polls/${poll3.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();

  await calculateUserHonors();
  rank = await getUserRank(dbClient, Leos._id);
  expect(rank).toBe('student');

  const blogBody = {
    title: 'First blog',
    source: { date: new Date().getTime(), blocks: [], version: '2.18.0' },
    picture: 'picture.png',
    tags: ['tag', 'another tag'],
  };
  voteResponse = await api('blog', { method: 'POST', json: blogBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();

  await calculateUserHonors();
  rank = await getUserRank(dbClient, Leos._id);
  expect(rank).toBe('graduate');

  let foundWeeks = [
    { _id: 27, shares: 1 },
    { _id: 28, shares: 0 },
    { _id: 29, shares: 1 },
    { _id: 30, shares: 0 },
    { _id: 31, shares: 1 },
    { _id: 32, shares: 0 },
    { _id: 33, shares: 1 },
    { _id: 34, shares: 0 },
    { _id: 35, shares: 1 },
    { _id: 36, shares: 1 },
  ];
  let start = dayjs('2020-06-29');
  let calculatedWeeks = calculateConsecutiveSharing(start, foundWeeks);
  expect(calculatedWeeks).toStrictEqual({ sharingWeeksCount: 2,
    sharingWeeksList: [
      { week: 27, shared: true },
      { week: 28, shared: false },
      { week: 29, shared: true },
      { week: 30, shared: false },
      { week: 31, shared: true },
      { week: 32, shared: false },
      { week: 33, shared: true },
      { week: 34, shared: false },
      { week: 35, shared: true },
      { week: 36, shared: true },
    ] });

  start = dayjs('2019-12-22');
  foundWeeks = [
    { _id: 52, shares: 1 },
    { _id: 3, shares: 1 },
    { _id: 4, shares: 2 },
    { _id: 7, shares: 3 },
  ];
  calculatedWeeks = calculateConsecutiveSharing(start, foundWeeks);
  expect(calculatedWeeks).toStrictEqual({ sharingWeeksCount: 0,
    sharingWeeksList: [
      { week: 51, shared: false },
      { week: 52, shared: true },
      { week: 1, shared: false },
      { week: 2, shared: false },
      { week: 3, shared: true },
      { week: 4, shared: true },
      { week: 5, shared: false },
      { week: 6, shared: false },
      { week: 7, shared: true },
      { week: 8, shared: false },
    ] });

  done();
});

beforeEach(async () => {
  const db = dbClient.db();
  await db.collection('users').deleteMany({});
  await db.collection('comments').deleteMany({});
  await db.collection('items').deleteMany({});
  await db.collection('poll_votes').deleteMany({});
  await db.collection('comment_votes').deleteMany({});
  await db.collection('link_shares').deleteMany({});
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
