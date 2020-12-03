const dotenv = require('dotenv');
const path = require('path');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

const envPath = path.join(__dirname, '..', '.test.env');
dotenv.config({ path: envPath });

const mongo = require('../src/utils/mongo.js');
const { logger } = require('../src/utils/logging');
const app = require('../src/server.js');
const {
  api, bff, getAuthHeader, getActivityCounter, resetHonors,
} = require('./testUtils');
const {
  setup, Leos, Jiri, Lukas, Vita, Jana, Bara,
} = require('./prepareUsers');

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
  const poll = await api('polls', { method: 'POST', json: pollBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(poll.success).toBeTruthy();

  let comments = await bff(`items/${poll.data._id}/comments`).json();
  expect(comments.success).toBeTruthy();
  expect(comments.data.comments.length).toBe(0);
  expect(comments.data.incomplete).toBeFalsy();

  const commentBody = {
    source: '<h3>This is Header.</h3><p>This is test paragraph.</p>',
    date: dayjs(poll.data.info.date).add(10, 'minute').format(DATE_FORMAT),
  };
  const comment1 = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(comment1.success).toBeTruthy();

  const voteBody = {
    vote: 1,
  };
  let voteResponse = await api(`comments/${comment1.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(voteResponse.success).toBeFalsy();
  voteResponse = await api(`comments/${comment1.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteResponse = await api(`comments/${comment1.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteResponse = await api(`comments/${comment1.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteBody.vote = -1;
  voteResponse = await api(`comments/${comment1.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Bara.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteResponse = await api(`comments/${comment1.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jana.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteResponse = await api(`comments/${comment1.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jana.jwt) }).json();
  expect(voteResponse.success).toBeFalsy();

  let pollResponse = await bff(`polls/${poll.data.info.slug}`).json();
  expect(pollResponse.data.comments.count).toBe(1);
  expect(dayjs.utc(pollResponse.data.comments.last, DATE_FORMAT).local().format(DATE_FORMAT)).toBe(commentBody.date);

  voteResponse = await bff(`comments/${comment1.data.comment._id}/votes`).json();
  expect(voteResponse.success).toBeTruthy();
  expect(voteResponse.data.length).toBe(5);

  commentBody.text = 'Comment 2';
  commentBody.date = dayjs(poll.data.info.date).add(20, 'minute').format(DATE_FORMAT);
  const comment2 = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(comment2.success).toBeTruthy();

  pollResponse = await bff(`polls/${poll.data.info.slug}`).json();
  expect(pollResponse.data.comments.count).toBe(2);
  expect(dayjs.utc(pollResponse.data.comments.last, DATE_FORMAT).local().format(DATE_FORMAT)).toBe(commentBody.date);

  voteBody.vote = -1;
  voteResponse = await api(`comments/${comment2.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteResponse = await api(`comments/${comment2.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteBody.vote = 1;
  voteResponse = await api(`comments/${comment2.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteResponse = await api(`comments/${comment2.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jana.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();

  voteResponse = await bff(`comments/${comment2.data.comment._id}/votes`).json();
  expect(voteResponse.success).toBeTruthy();
  expect(voteResponse.data.length).toBe(4);

  commentBody.text = 'Comment 3';
  commentBody.date = dayjs(poll.data.info.date).add(30, 'minute').format(DATE_FORMAT);
  const comment3 = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Bara.jwt) }).json();
  expect(comment3.success).toBeTruthy();

  voteResponse = await api(`comments/${comment3.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteResponse = await api(`comments/${comment3.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jana.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();

  voteResponse = await bff(`comments/${comment3.data.comment._id}/votes`).json();
  expect(voteResponse.success).toBeTruthy();
  expect(voteResponse.data.length).toBe(2);

  commentBody.text = 'Comment 4';
  commentBody.date = dayjs(poll.data.info.date).add(40, 'minute').format(DATE_FORMAT);
  const comment4 = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Jana.jwt) }).json();
  expect(comment4.success).toBeTruthy();

  commentBody.text = 'Comment 5';
  commentBody.date = dayjs(poll.data.info.date).add(50, 'minute').format(DATE_FORMAT);
  const comment5 = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(comment5.success).toBeTruthy();

  voteBody.vote = -1;
  voteResponse = await api(`comments/${comment5.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteResponse = await api(`comments/${comment5.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();

  voteResponse = await bff(`comments/${comment5.data.comment._id}/votes`).json();
  expect(voteResponse.success).toBeTruthy();
  expect(voteResponse.data.length).toBe(2);

  commentBody.text = 'Comment 6';
  commentBody.date = dayjs(poll.data.info.date).add(60, 'minute').format(DATE_FORMAT);
  const comment6 = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(comment6.success).toBeTruthy();

  voteResponse = await bff(`comments/${comment6.data.comment._id}/votes`).json();
  expect(voteResponse.success).toBeTruthy();
  expect(voteResponse.data.length).toBe(0);

  commentBody.text = 'Comment 1a';
  commentBody.parentId = comment1.data.comment._id;
  commentBody.date = dayjs(comment1.data.comment.created).add(1, 'minute').format(DATE_FORMAT);
  const comment1a = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(comment1a.success).toBeTruthy();

  // only discussion with two levels are allowed
  commentBody.text = 'Comment 1aa';
  commentBody.parentId = comment1a.data.comment._id;
  const comment1aa = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(comment1aa.success).toBeFalsy();

  voteBody.vote = 1;
  voteResponse = await api(`comments/${comment1a.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteBody.vote = -1;
  voteResponse = await api(`comments/${comment1a.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();

  voteResponse = await bff(`comments/${comment1a.data.comment._id}/votes`).json();
  expect(voteResponse.success).toBeTruthy();
  expect(voteResponse.data.length).toBe(2);

  commentBody.text = 'Comment 1b';
  commentBody.parentId = comment1.data.comment._id;
  commentBody.date = dayjs(comment1.data.comment.created).add(2, 'minute').format(DATE_FORMAT);
  const comment1b = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(comment1b.success).toBeTruthy();

  voteBody.vote = 1;
  voteResponse = await api(`comments/${comment1b.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();

  voteResponse = await bff(`comments/${comment1b.data.comment._id}/votes`).json();
  expect(voteResponse.success).toBeTruthy();
  expect(voteResponse.data.length).toBe(1);

  commentBody.text = 'Comment 1c';
  commentBody.parentId = comment1.data.comment._id;
  commentBody.date = dayjs(comment1.data.comment.created).add(3, 'minute').format(DATE_FORMAT);
  const comment1c = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(comment1c.success).toBeTruthy();

  commentBody.text = 'Comment 1d';
  commentBody.parentId = comment1.data.comment._id;
  commentBody.date = dayjs(comment1.data.comment.created).add(4, 'minute').format(DATE_FORMAT);
  const comment1d = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(comment1d.success).toBeTruthy();

  voteResponse = await api(`comments/${comment1d.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();

  commentBody.text = 'Comment 1e';
  commentBody.parentId = comment1.data.comment._id;
  commentBody.date = dayjs(comment1.data.comment.created).add(5, 'minute').format(DATE_FORMAT);
  const comment1e = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Jana.jwt) }).json();
  expect(comment1e.success).toBeTruthy();

  voteBody.vote = -1;
  voteResponse = await api(`comments/${comment1e.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Bara.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();

  commentBody.text = 'Comment 1f';
  commentBody.parentId = comment1.data.comment._id;
  commentBody.date = dayjs(comment1.data.comment.created).add(6, 'minute').format(DATE_FORMAT);
  const comment1f = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Bara.jwt) }).json();
  expect(comment1f.success).toBeTruthy();

  commentBody.text = 'Comment 2a';
  commentBody.parentId = comment2.data.comment._id;
  commentBody.date = dayjs(comment2.data.comment.created).add(1, 'hour').format(DATE_FORMAT);
  const comment2a = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(comment2a.success).toBeTruthy();

  voteBody.vote = 1;
  voteResponse = await api(`comments/${comment2a.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Bara.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();

  commentBody.text = 'Comment 2b';
  commentBody.parentId = comment2.data.comment._id;
  commentBody.date = dayjs(comment2.data.comment.created).add(2, 'hour').format(DATE_FORMAT);
  const comment2b = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(comment2b.success).toBeTruthy();

  commentBody.text = 'Comment 2c';
  commentBody.parentId = comment2.data.comment._id;
  commentBody.date = dayjs(comment2.data.comment.created).add(3, 'hour').format(DATE_FORMAT);
  const comment2c = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(comment2c.success).toBeTruthy();

  voteBody.vote = -1;
  voteResponse = await api(`comments/${comment2c.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Bara.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();

  commentBody.text = 'Comment 2d';
  commentBody.parentId = comment2.data.comment._id;
  commentBody.date = dayjs(comment2.data.comment.created).add(4, 'hour').format(DATE_FORMAT);
  const comment2d = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Bara.jwt) }).json();
  expect(comment2d.success).toBeTruthy();

  commentBody.text = 'Comment 4a';
  commentBody.parentId = comment4.data.comment._id;
  commentBody.date = dayjs(comment4.data.comment.created).add(5, 'minute').format(DATE_FORMAT);
  const comment4a = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Bara.jwt) }).json();
  expect(comment4a.success).toBeTruthy();

  commentBody.text = 'Comment 4b';
  commentBody.parentId = comment4.data.comment._id;
  commentBody.date = dayjs(comment4.data.comment.created).add(10, 'minute').format(DATE_FORMAT);
  const comment4b = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Jana.jwt) }).json();
  expect(comment4b.success).toBeTruthy();

  commentBody.text = 'Comment 4c';
  commentBody.parentId = comment4.data.comment._id;
  commentBody.date = dayjs(comment4.data.comment.created).add(15, 'minute').format(DATE_FORMAT);
  const comment4c = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Bara.jwt) }).json();
  expect(comment4c.success).toBeTruthy();

  voteBody.vote = 1;
  voteResponse = await api(`comments/${comment4c.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jana.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();

  commentBody.text = 'Comment 4d';
  commentBody.parentId = comment4.data.comment._id;
  commentBody.date = dayjs(comment4.data.comment.created).add(20, 'minute').format(DATE_FORMAT);
  const comment4d = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Jana.jwt) }).json();
  expect(comment4d.success).toBeTruthy();

  commentBody.text = 'Comment 4e';
  commentBody.parentId = comment4.data.comment._id;
  commentBody.date = dayjs(comment4.data.comment.created).add(25, 'minute').format(DATE_FORMAT);
  const comment4e = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Jana.jwt) }).json();
  expect(comment4e.success).toBeTruthy();

  commentBody.text = 'Comment 4f';
  commentBody.parentId = comment4.data.comment._id;
  commentBody.date = dayjs(comment4.data.comment.created).add(40, 'minute').format(DATE_FORMAT);
  const comment4f = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Bara.jwt) }).json();
  expect(comment4f.success).toBeTruthy();

  commentBody.text = 'Comment 4g';
  commentBody.parentId = comment4.data.comment._id;
  commentBody.date = dayjs(comment4.data.comment.created).add(40, 'minute').format(DATE_FORMAT);
  const comment4g = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Jana.jwt) }).json();
  expect(comment4g.success).toBeTruthy();

  commentBody.text = 'Comment 4h';
  commentBody.parentId = comment4.data.comment._id;
  commentBody.date = dayjs(comment4.data.comment.created).add(45, 'minute').format(DATE_FORMAT);
  const comment4h = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Bara.jwt) }).json();
  expect(comment4h.success).toBeTruthy();

  commentBody.text = 'Comment 4i';
  commentBody.parentId = comment4.data.comment._id;
  commentBody.date = dayjs(comment4.data.comment.created).add(40, 'minute').format(DATE_FORMAT);
  const comment4i = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Jana.jwt) }).json();
  expect(comment4i.success).toBeTruthy();
  expect(comment4i.data.replies[0].text).toBe(comment4a.data.comment.text);
  expect(comment4i.data.replies[1].text).toBe(comment4b.data.comment.text);
  expect(comment4i.data.replies[2].text).toBe(comment4c.data.comment.text);
  expect(comment4i.data.replies[3].text).toBe(comment4d.data.comment.text);
  expect(comment4i.data.replies[4].text).toBe(comment4e.data.comment.text);
  expect(comment4i.data.replies[5].text).toBe(comment4f.data.comment.text);
  expect(comment4i.data.replies[6].text).toBe(comment4g.data.comment.text);
  expect(comment4i.data.replies[7].text).toBe(comment4h.data.comment.text);
  expect(comment4i.data.replies[8].text).toBe(comment4i.data.comment.text);

  commentBody.text = 'Comment 6a';
  commentBody.parentId = comment6.data.comment._id;
  commentBody.date = dayjs(comment6.data.comment.created).add(3, 'minute').format(DATE_FORMAT);
  const comment6a = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(comment6a.success).toBeTruthy();

  commentBody.text = 'Comment 6b';
  commentBody.parentId = comment6.data.comment._id;
  commentBody.date = dayjs(comment6.data.comment.created).add(6, 'minute').format(DATE_FORMAT);
  const comment6b = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(comment6b.success).toBeTruthy();

  comments = await bff(`items/${poll.data._id}/comments`).json();
  expect(comments.success).toBeTruthy();
  expect(comments.data.incomplete).toBeTruthy();
  expect(comments.data.comments.length).toBe(3);
  expect(comments.data.comments[0].text).toBe(comment6.data.comment.text);
  expect(comments.data.comments[0].up).toBe(0);
  expect(comments.data.comments[0].down).toBe(0);
  expect(comments.data.comments[0].replies.length).toBe(2);
  expect(comments.data.comments[0].replies[0].text).toBe(comment6a.data.comment.text);
  expect(comments.data.comments[0].replies[0].votes.length).toBe(0);
  expect(comments.data.comments[0].replies[1].text).toBe(comment6b.data.comment.text);
  expect(comments.data.comments[1].text).toBe(comment5.data.comment.text);
  expect(comments.data.comments[1].up).toBe(0);
  expect(comments.data.comments[1].down).toBe(2);
  expect(comments.data.comments[1].replies).toBeUndefined();
  expect(comments.data.comments[2].text).toBe(comment4.data.comment.text);
  expect(comments.data.comments[2].up).toBe(0);
  expect(comments.data.comments[2].down).toBe(0);
  expect(comments.data.comments[2].replies.length).toBe(9);
  expect(comments.data.comments[2].replies[0].text).toBe(comment4a.data.comment.text);
  expect(comments.data.comments[2].replies[1].text).toBe(comment4b.data.comment.text);
  expect(comments.data.comments[2].replies[2].text).toBe(comment4c.data.comment.text);
  expect(comments.data.comments[2].replies[3].text).toBe(comment4d.data.comment.text);
  expect(comments.data.comments[2].replies[4].text).toBe(comment4e.data.comment.text);
  expect(comments.data.comments[2].replies[5].text).toBe(comment4f.data.comment.text);
  expect(comments.data.comments[2].replies[6].text).toBe(comment4g.data.comment.text);
  expect(comments.data.comments[2].replies[7].text).toBe(comment4h.data.comment.text);
  expect(comments.data.comments[2].replies[8].text).toBe(comment4i.data.comment.text);

  comments = await bff(`items/${poll.data._id}/comments?lr=id:${comments.data.comments[2]._id}`).json();
  expect(comments.success).toBeTruthy();
  expect(comments.data.incomplete).toBeFalsy();
  expect(comments.data.comments.length).toBe(3);
  expect(comments.data.comments[0].text).toBe(comment3.data.comment.text);
  expect(comments.data.comments[0].up).toBe(2);
  expect(comments.data.comments[0].down).toBe(0);
  expect(comments.data.comments[0].votes.length).toBe(2);
  expect(comments.data.comments[0].replies).toBeUndefined();
  expect(comments.data.comments[1].text).toBe(comment2.data.comment.text);
  expect(comments.data.comments[1].up).toBe(2);
  expect(comments.data.comments[1].down).toBe(2);
  expect(comments.data.comments[1].votes.length).toBe(4);
  expect(comments.data.comments[1].replies.length).toBe(4);
  expect(comments.data.comments[2].text).toBe(comment1.data.comment.text);
  expect(comments.data.comments[2].up).toBe(3);
  expect(comments.data.comments[2].down).toBe(2);
  expect(comments.data.comments[2].votes.length).toBe(5);
  expect(comments.data.comments[2].replies.length).toBe(6);
  expect(comments.data.comments[2].replies[0].text).toBe(comment1a.data.comment.text);
  expect(comments.data.comments[2].replies[0].votes.length).toBe(2);

  comments = await bff(`items/${poll.data._id}/comments/${comment4.data.comment._id}`).json();
  expect(comments.success).toBeTruthy();
  expect(comments.data.comment.replies.length).toBe(9);
  expect(comments.data.comment.replies[0].text).toBe(comment4a.data.comment.text);
  expect(comments.data.comment.replies[1].text).toBe(comment4b.data.comment.text);
  expect(comments.data.comment.replies[2].text).toBe(comment4c.data.comment.text);
  expect(comments.data.comment.replies[3].text).toBe(comment4d.data.comment.text);
  expect(comments.data.comment.replies[4].text).toBe(comment4e.data.comment.text);
  expect(comments.data.comment.replies[5].text).toBe(comment4f.data.comment.text);
  expect(comments.data.comment.replies[6].text).toBe(comment4g.data.comment.text);
  expect(comments.data.comment.replies[7].text).toBe(comment4h.data.comment.text);
  expect(comments.data.comment.replies[8].text).toBe(comment4i.data.comment.text);

  commentBody.source = '<h3 onmouseover=alert(\'Wufff!\')> Comment 7 </h3><p> New paragraph </p><p> Third paragraph </p><SCRIPT SRC=http://xss.rocks/xss.js></SCRIPT><IMG SRC=javAScript:alert(&quot;XSS&quot;)>';
  commentBody.date = dayjs(poll.data.info.date).add(70, 'minute').format(DATE_FORMAT);
  const comment7 = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(comment7.success).toBeTruthy();
  expect(comment7.data.comment.text).toBe('<h3> Comment 7 </h3><p> New paragraph </p><p> Third paragraph </p><img />');

  let counter = await getActivityCounter(dbClient, Leos._id, 'comments');
  expect(counter).toBe(3);
  counter = await getActivityCounter(dbClient, Leos._id, 'commentVotes');
  expect(counter).toBe(3);

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
  await setup(dbClient, api);
  await resetHonors(dbClient);
});

afterAll(() => {
  mongo.close();
  server.close();
  logger.info('Server stopped');
});
