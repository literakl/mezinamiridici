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

const mongo = require('../src/utils/mongo');
const { log } = require('../src/utils/logging');
const app = require('..');
const {
  api, bff, getAuthHeader, shuffle,
} = require('./testUtils');
const {
  setup, Leos, Jiri, Lukas, Vita, Jana, Bara
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
  server = app.listen(3000, () => log.info('Server started'));
  dbClient = await mongo.connectToDatabase();
  const db = dbClient.db();
  try {
    dropCollection(db, 'users');
    dropCollection(db, 'items');
    dropCollection(db, 'comments');
    dropCollection(db, 'comment_votes');
    dropCollection(db, 'poll_votes');
    dropCollection(db, 'link_shares');
    dropCollection(db, 'social_login');
    dropCollection(db, 'snippets');
    await setup(dbClient, api);
    await mongo.setupIndexes(dbClient);
  } catch (e) {
    log.error(e);
    process.exit(1);
  }

  let date = dayjs();
  let body = {
    text: 'Řidič karavanu se kochá krajinou a brzdí provoz, kde se nedá předjet',
    picture: '/images/stream/ale-sat-UlmLMQC8pJ4-unsplash.jpg',
    tags: ['Car accidents', 'Crossroads', 'Motorbikes'],
    author: Leos._id,
    date: date.subtract(14, 'day').format(DAY_FORMAT),
    published: true,
  };
  let poll = await api('polls', { method: 'POST', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  await api(`polls/${poll.data._id}`, { method: 'PATCH', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  await generateComments(poll.data._id, body.date);

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

  body.text = 'Předjíždění dlouhé kolony v protisměru';
  body.picture = '/images/stream/daniel-j-schwarz-GK9mi6_DuRw-unsplash.jpg';
  body.tags = ['Police', 'Crossroads', 'Trucks'];
  body.date = dayjs().subtract(10, 'day').format(DAY_FORMAT);
  body.author = Bara._id;
  poll = await api('polls', { method: 'POST', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  await api(`polls/${poll.data._id}`, { method: 'PATCH', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  await generateComments(poll.data._id, body.date);

  voteBody = { vote: 'neutral' };
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Bara.jwt) }).json();
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jana.jwt) }).json();
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Lukas.jwt) }).json();
  voteBody = { vote: 'dislike' };
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Vita.jwt) }).json();
  voteBody = { vote: 'hate' };
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Leos.jwt) }).json();
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jiri.jwt) }).json();

  body.text = 'Jízda po tramvajovém pásu, kde to není povoleno';
  body.picture = '/images/stream/vladimir-haltakov-3kywHnYzAn4-unsplash.jpg';
  body.tags = ['Car accidents', 'Pedestrians', 'Trucks', 'Highways'];
  body.date = dayjs().subtract(7, 'day').format(DAY_FORMAT);
  body.author = Bara._id;
  poll = await api('polls', { method: 'POST', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  await api(`polls/${poll.data._id}`, { method: 'PATCH', json: body, headers: getAuthHeader(Leos.jwt) }).json();

  voteBody = { vote: 'neutral' };
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Bara.jwt) }).json();
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jana.jwt) }).json();
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Lukas.jwt) }).json();
  voteBody = { vote: 'dislike' };
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Vita.jwt) }).json();
  voteBody = { vote: 'hate' };
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Leos.jwt) }).json();
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jiri.jwt) }).json();
  await generateComments(poll.data._id, body.date);

  body.text = 'Jízda v těsném závěsu za kamionem';
  body.picture = '/images/stream/marcus-platt-evVlOOdYw-4-unsplash.jpg';
  body.tags = ['Tramway', 'Bus'];
  body.date = dayjs().subtract(1, 'day').format(DAY_FORMAT);
  body.author = Jana._id;
  poll = await api('polls', { method: 'POST', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  await api(`polls/${poll.data._id}`, { method: 'PATCH', json: body, headers: getAuthHeader(Leos.jwt) }).json();

  voteBody = { vote: 'dislike' };
  await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Vita.jwt) }).json();

  const commentsCount = random.int(1, 10);
  for (let i = 0; i < commentsCount; i += 1) {
    date = dayjs(body.date).add(random.int(1, 60), 'minute');
    await createThread(poll.data._id, date, random.int(0, 20));
  }

  body = {
    caption: 'Help',
    slug: 'napoveda',
    content: '<h1>Help</h1><p>This site does not need any help</p>',
  };
  await api('pages', { method: 'POST', json: body, headers: getAuthHeader(Leos.jwt) }).json();

  body = {
    title: 'Analýza nehody kamiónu s autobusem U Tří křížů',
    source: randomSource(6),
    picture: '/images/stream/roman-fox-qoXgaF27zBc-unsplash.jpg',
    tags: ['Trucks', 'Car accidents'],
    date: dayjs().subtract(16, 'day').format(DATE_FORMAT),
  };
  let blog = await api('posts', { method: 'POST', json: body, headers: getAuthHeader(Vita.jwt) }).json();
  await generateComments(blog.data._id, body.date);

  body.title = 'Nejčastější místa policejních kontrol';
  body.source = randomSource(4);
  body.picture = '/images/stream/jack-anstey-XVoyX7l9ocY-unsplash.jpg';
  body.tags = ['Police'];
  body.date = dayjs().subtract(13, 'day').format(DATE_FORMAT);
  blog = await api('posts', { method: 'POST', json: body, headers: getAuthHeader(Vita.jwt) }).json();
  await generateComments(blog.data._id, body.date);

  body.title = 'Nejnebezpečnější křižovatky Česka';
  body.source = randomSource(3);
  body.picture = '/images/stream/sabrina-mazzeo-pz0P5piDQXs-unsplash.jpg';
  body.tags = ['Crossroads', 'Car accidents'];
  body.date = dayjs().subtract(9, 'day').format(DATE_FORMAT);
  blog = await api('posts', { method: 'POST', json: body, headers: getAuthHeader(Vita.jwt) }).json();
  await generateComments(blog.data._id, body.date);

  body.title = 'Deset nejhorších chyb při řízení';
  body.source = randomSource(6);
  body.picture = '/images/stream/shane-aldendorff-UNo3mR8JyT4-unsplash.jpg';
  body.date = dayjs().subtract(7, 'day').format(DATE_FORMAT);
  blog = await api('posts', { method: 'POST', json: body, headers: getAuthHeader(Vita.jwt) }).json();
  await generateComments(blog.data._id, body.date);

  body.title = 'Co dělat při poruše na dálnici';
  body.source = randomSource(2);
  body.picture = '/images/stream/valik-chernetskyi-OOV0H-jIKTM-unsplash.jpg';
  body.date = dayjs().subtract(5, 'day').format(DATE_FORMAT);
  blog = await api('posts', { method: 'POST', json: body, headers: getAuthHeader(Vita.jwt) }).json();
  await generateComments(blog.data._id, body.date);

  body.title = 'Jak poskytnout první pomoc I';
  body.source = randomSource(2);
  body.picture = '/images/stream/abed-ismail-uCdqsulpdT0-unsplash.jpg';
  body.date = dayjs().subtract(2, 'day').format(DATE_FORMAT);
  blog = await api('posts', { method: 'POST', json: body, headers: getAuthHeader(Vita.jwt) }).json();
  await generateComments(blog.data._id, body.date);

  body.title = 'Video šíleného řidiče kamiónu předjíždějícího v křižovatce';
  body.source = randomSource(2);
  body.picture = '/images/stream/aceofnet-I3Em9PGzkzw-unsplash.jpg';
  body.tags = ['Trucks'];
  body.date = dayjs().subtract(1, 'day').format(DATE_FORMAT);
  blog = await api('posts', { method: 'POST', json: body, headers: getAuthHeader(Vita.jwt) }).json();
  await generateComments(blog.data._id, body.date);

  body.title = 'Jak poskytnout první pomoc II';
  body.source = randomSource(2);
  body.picture = '/images/stream/vladimir-haltakov-9J4Id8uXcQU-unsplash.jpg';
  body.date = dayjs().subtract(0, 'day').format(DATE_FORMAT);
  blog = await api('posts', { method: 'POST', json: body, headers: getAuthHeader(Vita.jwt) }).json();
  await generateComments(blog.data._id, body.date);

  body.title = 'Máte kompletní lékarničku dle předpisů?';
  body.source = randomSource(2);
  body.picture = '/images/stream/ale-sat-UlmLMQC8pJ4-unsplash.jpg';
  body.date = dayjs().subtract(2, 'hour').format(DATE_FORMAT);
  blog = await api('posts', { method: 'POST', json: body, headers: getAuthHeader(Vita.jwt) }).json();
  await generateComments(blog.data._id, body.date);

  body.title = 'Vtipné video z parkování';
  body.source = randomSource(2);
  body.picture = '/images/stream/alex-h-pflaum-3CW11ymVHJQ-unsplash.jpg';
  body.date = dayjs().subtract(90, 'minute').format(DATE_FORMAT);
  blog = await api('posts', { method: 'POST', json: body, headers: getAuthHeader(Vita.jwt) }).json();
  await generateComments(blog.data._id, body.date);

  mongo.close();
  server.close();
  log.info('Server stopped');
}

async function generateComments(itemId, startDate) {
  // const commentsCount = random.int(1, 10), repliesCount = random.int(0, 20);
  const commentsCount = 1, repliesCount = 1;
  let date = startDate;
  for (let i = 0; i < commentsCount; i += 1) {
    date = dayjs(date).add(random.int(1, 60), 'minute');
    await createThread(itemId, date, repliesCount);
  }
}

async function createThread(itemId, date, repliesCount) {
  const body = {
    source: randomSource(random.int(1, 10)),
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
    body.source = randomSource(random.int(1, 5));
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

function randomSource(paragraphs) {
  let source = '';
  for (let i = 0; i < paragraphs;) {
    source = source.concat('<p>', lorem.generateSentences(random.int(1, 10)), '</p>\n');
    i += 1;
  }
  return source;
}

function randomUser() {
  return USERS[random.int(0, USERS.length - 1)];
}

function dropCollection(db, name) {
  db.collection(name)
    .dropIndexes()
    .then(() => log.info(`Indexes for ${name} were deleted`))
    .catch(() => log.info(`Indexes for ${name} were not deleted`));

  db.collection(name)
    .drop()
    .then(() => log.info(`Collection ${name} was deleted`))
    .catch(() => log.info(`Collection ${name} was not deleted`));
}
