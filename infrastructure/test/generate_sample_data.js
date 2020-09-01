/* eslint-disable no-await-in-loop, import/no-extraneous-dependencies */

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const { LoremIpsum } = require('lorem-ipsum');
const random = require('random');

dayjs.extend(utc);
const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
});

const mongo = require('../src/utils/mongo.js');
const logger = require('../src/utils/logging');
const app = require('..');
const {
  api, bff, getAuthHeader, shuffle,
} = require('./testUtils');
const {
  setup, Leos, Jiri, Lukas, Vita, Jana, Bara,
} = require('./prepareUsers');

const USERS = [Leos, Jiri, Lukas, Vita, Jana, Bara];

let server;
let dbClient;

const DAY_FORMAT = 'YYYY-MM-DD';
const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

console.log('Started');
generateData()
  .then(() => {
    console.log('Finished');
  });

async function generateData() {
  server = app.listen(3000, () => logger.info('Server started'));
  dbClient = await mongo.connectToDatabase();
  const db = dbClient.db();
  try {
    dropCollection(db, 'users');
    dropCollection(db, 'items');
    dropCollection(db, 'comments');
    dropCollection(db, 'comment_votes');
    dropCollection(db, 'user_activity');
    await setup(dbClient, api);
    await mongo.setupIndexes(dbClient);
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }

  let date = dayjs();
  const body = {
    text: lorem.generateWords(7),
    picture: 'picture.png',
    author: Leos._id,
    date: date.subtract(14, 'day').format(DAY_FORMAT),
    published: true,
  };
  let poll = await api('polls', { method: 'POST', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  await api(`polls/${poll.data._id}`, { method: 'PATCH', json: poll, headers: getAuthHeader(Leos.jwt) }).json();

  let voteBody = { vote: 'neutral' };
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Leos.jwt) }).json();
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jiri.jwt) }).json();
  voteBody = { vote: 'trivial' };
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Lukas.jwt) }).json();
  voteBody = { vote: 'dislike' };
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Vita.jwt) }).json();
  voteBody = { vote: 'hate' };
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Bara.jwt) }).json();
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jana.jwt) }).json();

  let commentsCount = random.int(5, 50);
  for (let i = 0; i < commentsCount; i += 1) {
    date = date.add(random.int(1, 60), 'minute');
    await generateComment(poll.data._id, date, random.int(0, 20));
  }

  body.text = lorem.generateWords(5);
  body.date = dayjs().subtract(7, 'day').format(DAY_FORMAT);
  body.author = Bara._id;
  poll = await api('polls', { method: 'POST', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  await api(`polls/${poll.data._id}`, { method: 'PATCH', json: poll, headers: getAuthHeader(Leos.jwt) }).json();

  voteBody = { vote: 'neutral' };
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Bara.jwt) }).json();
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jana.jwt) }).json();
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Lukas.jwt) }).json();
  voteBody = { vote: 'dislike' };
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Vita.jwt) }).json();
  voteBody = { vote: 'hate' };
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Leos.jwt) }).json();
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jiri.jwt) }).json();

  commentsCount = random.int(5, 50);
  for (let i = 0; i < commentsCount; i += 1) {
    date = date.add(random.int(1, 60), 'minute');
    await generateComment(poll.data._id, date, random.int(0, 20));
  }

  body.text = lorem.generateWords(9);
  body.date = dayjs().subtract(1, 'day').format(DAY_FORMAT);
  body.author = Jana._id;
  poll = await api('polls', { method: 'POST', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  await api(`polls/${poll.data._id}`, { method: 'PATCH', json: poll, headers: getAuthHeader(Leos.jwt) }).json();

  voteBody = { vote: 'dislike' };
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Vita.jwt) }).json();

  commentsCount = random.int(5, 50);
  for (let i = 0; i < commentsCount; i += 1) {
    date = date.add(random.int(1, 60), 'minute');
    await generateComment(poll.data._id, date, random.int(0, 20));
  }

  mongo.close();
  server.close();
  logger.info('Server stopped');
}

async function generateComment(itemId, date, repliesCount) {
  const body = {
    text: randomText(),
    date: date.format(DATE_FORMAT),
  };
  let user = randomUser();
  const comment = await api(`items/${itemId}/comments`, { method: 'POST', json: body, headers: getAuthHeader(user.jwt) }).json();
  await voteComment(comment.data.comment._id, user._id);

  let aDate = date;
  body.parentId = comment.data.comment._id;
  for (let i = 0; i <= repliesCount; i += 1) {
    user = randomUser();
    aDate = aDate.add(random.int(1, 30), 'minute');
    body.text = randomText();
    body.date = aDate.format(DATE_FORMAT);
    const reply = await api(`items/${itemId}/comments`, { method: 'POST', json: body, headers: getAuthHeader(user.jwt) }).json();
    await voteComment(reply.data.comment._id, user._id);
  }
}

async function voteComment(commentId, authorId) {
  const count = random.int(0, 5);
  const body = { vote: 1 };
  let user;
  const users = shuffle(USERS.slice(0)).filter(value => (value._id !== authorId)).slice(0, count);
  for (let i = 0; i < count; i += 1) {
    user = users[i];
    body.vote = (random.int(0, 100) >= 75) ? 1 : -1;
    await api(`comments/${commentId}/votes`, { method: 'POST', json: body, headers: getAuthHeader(user.jwt) }).json();
  }
}

function randomText() {
  if (random.int(0, 100) < 60) {
    return lorem.generateSentences(random.int(1, 5));
  } else {
    return lorem.generateParagraphs(random.int(1, 3));
  }
}

function randomUser() {
  return USERS[random.int(0, USERS.length - 1)];
}

function dropCollection(db, name) {
  db.collection(name).dropIndexes().then(logger.info(`Indexes for ${name} were deleted`)).catch(logger.info(`Indexes for ${name} were not deleted`));
  db.collection(name).drop().then(logger.info(`Collection ${name} was deleted`)).catch(logger.info(`Collection ${name} was not deleted`));
}
