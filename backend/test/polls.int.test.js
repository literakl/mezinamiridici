const dotenv = require('dotenv');
const path = require('path');
const dayjs = require('dayjs');

const envPath = path.join(__dirname, '..', '.test.env');
dotenv.config({ path: envPath });

const mongo = require('../src/utils/mongo.js');
const { logger } = require('../src/utils/logging');
const app = require('../src/server.js');
const {
  api, bff, getAuthHeader, deepCopy, getActivityCounter, resetHonors,
} = require('./testUtils');
const {
  setup, Leos, Jiri, Lukas, Vita, Jana, Bara,
} = require('./prepareUsers');

let server;
let dbClient;

test('Poll API', async (done) => {
  jest.setTimeout(180000);

  // create poll, anonymous user
  let body = {
    text: 'First question',
    picture: '/pictures/stream/default.jpg',
  };
  let response = await api('polls', { method: 'POST', json: body });
  expect(response.statusCode).toBe(401);

  // create poll, insufficient privilleges
  response = await api('polls', { method: 'POST', json: body, headers: getAuthHeader(Vita.jwt) });
  expect(response.statusCode).toBe(403);

  // create poll, admin privilleges
  const firstPoll = body;
  response = await api('polls', { method: 'POST', json: firstPoll, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  expect(response.data).toBeDefined();
  expect(response.data._id).toBeDefined();
  expect(response.data.info.author.nickname).toBe(Leos.bio.nickname);
  firstPoll.id = response.data._id;
  firstPoll.slug = response.data.info.slug;

  // create second poll
  const secondPoll = {
    text: 'Second question',
    picture: 'picture.png',
    author: Jana._id,
  };
  response = await api('polls', { method: 'POST', json: secondPoll, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  expect(response.data.info.author.nickname).toBe(Jana.bio.nickname);
  expect(response.data.info.picture).toBe(secondPoll.picture);
  secondPoll.id = response.data._id;
  secondPoll.slug = response.data.info.slug;

  // create third poll
  const thirdPoll = {
    text: 'Third question',
    picture: 'picture.png',
  };
  response = await api('polls', { method: 'POST', json: thirdPoll, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  thirdPoll.id = response.data._id;
  thirdPoll.slug = response.data.info.slug;

  // create fourth poll
  const fourthPoll = {
    text: 'Fourth question',
    picture: 'picture.png',
  };
  response = await api('polls', { method: 'POST', json: fourthPoll, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  fourthPoll.id = response.data._id;
  fourthPoll.slug = response.data.info.slug;

  // vote
  body = { vote: 'neutral' };
  response = await bff(`polls/${firstPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  expect(response.data).toBeDefined();
  expect(response.data._id).toBe(firstPoll.id);
  expect(response.data.info.caption).toBe(firstPoll.text);
  expect(response.data.info.slug).toBe('first-question');
  expect(response.data.info.published).toBe(false);
  expect(response.data.my_vote).toBe('neutral');
  expect(response.data.votes_count).toBe(1);
  expect(response.data.votes.neutral).toBe(1);
  expect(response.data.votes.trivial).toBe(0);
  expect(response.data.votes.dislike).toBe(0);
  expect(response.data.votes.hate).toBe(0);
  let counter = await getActivityCounter(dbClient, Leos._id, 'pollVotes');
  expect(counter).toBe(1);

  // get poll, anonymous user
  let getResponse = await bff(`polls/${response.data.info.slug}`).json();
  const copy = deepCopy(response);
  delete copy.data.my_vote;
  delete getResponse.data.siblings;
  expect(getResponse).toStrictEqual(copy);

  // get poll, other user that has not voted
  getResponse = await bff(`polls/${response.data.info.slug}`, { headers: getAuthHeader(Jiri.jwt) }).json();
  delete getResponse.data.siblings;
  expect(getResponse).toStrictEqual(copy);

  // get poll, user that has voted
  getResponse = await bff(`polls/${response.data.info.slug}`, { headers: getAuthHeader(Leos.jwt) }).json();
  delete getResponse.data.siblings;
  expect(getResponse).toStrictEqual(response);

  // get non-existent poll
  response = await bff('polls/abc', { responseType: 'json' });
  expect(response.statusCode).toBe(404);
  expect(response.body.success).toBeFalsy();

  // Leos' votes
  body = { vote: 'neutral' };
  response = await bff(`polls/${secondPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  response = await bff(`polls/${thirdPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  response = await bff(`polls/${fourthPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();
  // Jiri's votes
  body.vote = 'trivial';
  response = await bff(`polls/${firstPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(response.success).toBeTruthy();
  response = await bff(`polls/${secondPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(response.success).toBeTruthy();
  response = await bff(`polls/${thirdPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(response.success).toBeTruthy();
  response = await bff(`polls/${fourthPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(response.success).toBeTruthy();
  // Lukas's votes
  body.vote = 'neutral';
  response = await bff(`polls/${firstPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(response.success).toBeTruthy();
  body.vote = 'trivial';
  response = await bff(`polls/${secondPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(response.success).toBeTruthy();
  body.vote = 'dislike';
  response = await bff(`polls/${thirdPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(response.success).toBeTruthy();
  body.vote = 'hate';
  response = await bff(`polls/${fourthPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(response.success).toBeTruthy();
  // Vita's votes
  body.vote = 'dislike';
  response = await bff(`polls/${firstPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Vita.jwt) }).json();
  expect(response.success).toBeTruthy();
  response = await bff(`polls/${secondPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Vita.jwt) }).json();
  expect(response.success).toBeTruthy();
  response = await bff(`polls/${thirdPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Vita.jwt) }).json();
  expect(response.success).toBeTruthy();
  body.vote = 'hate';
  response = await bff(`polls/${fourthPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Vita.jwt) }).json();
  expect(response.success).toBeTruthy();
  // Jana's votes
  response = await bff(`polls/${firstPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Jana.jwt) }).json();
  expect(response.success).toBeTruthy();
  response = await bff(`polls/${secondPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Jana.jwt) }).json();
  expect(response.success).toBeTruthy();
  body.vote = 'trivial';
  response = await bff(`polls/${thirdPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Jana.jwt) }).json();
  expect(response.success).toBeTruthy();
  body.vote = 'hate';
  response = await bff(`polls/${fourthPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Jana.jwt) }).json();
  expect(response.success).toBeTruthy();
  // Bara's votes
  response = await bff(`polls/${firstPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Bara.jwt) }).json();
  expect(response.success).toBeTruthy();
  response = await bff(`polls/${fourthPoll.id}/votes`, { method: 'POST', json: body, headers: getAuthHeader(Bara.jwt) }).json();
  expect(response.success).toBeTruthy();

  // Invalid votes
  response = await bff(`polls/${firstPoll.id}/votes`, {
    method: 'POST', json: {}, responseType: 'json', headers: getAuthHeader(Jana.jwt),
  });
  expect(response.statusCode).toBe(400);
  expect(response.body.success).toBe(false);

  // check first poll as Leos
  response = await bff(`polls/${firstPoll.slug}`, { headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.data._id).toBe(firstPoll.id);
  expect(response.data.info.author.id).toBe(Leos._id);
  expect(response.data.info.author.nickname).toBe(Leos.bio.nickname);
  expect(response.data.my_vote).toBe('neutral');
  expect(response.data.votes_count).toBe(6);
  expect(response.data.votes.neutral).toBe(2);
  expect(response.data.votes.trivial).toBe(1);
  expect(response.data.votes.dislike).toBe(1);
  expect(response.data.votes.hate).toBe(2);
  expect(response.data.siblings.older).toBe(null);
  expect(response.data.siblings.newer).toBe(null);
  counter = await getActivityCounter(dbClient, Leos._id, 'pollVotes');
  expect(counter).toBe(4);

  // publish the fist poll
  firstPoll.published = true;
  firstPoll.date = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
  response = await api(`polls/${firstPoll.id}`, { method: 'PATCH', json: firstPoll, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();

  // update and publish the second poll
  secondPoll.text = 'The second question';
  secondPoll.picture = 'photo.png';
  secondPoll.published = true;
  secondPoll.author = Bara._id;
  secondPoll.date = dayjs().subtract(5, 'day').format('YYYY-MM-DD');
  response = await api(`polls/${secondPoll.id}`, { method: 'PATCH', json: secondPoll, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();

  // check first poll as Leos again
  response = await bff(`polls/${firstPoll.slug}`, { headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.data._id).toBe(firstPoll.id);
  expect(response.data.siblings.older).toBe(null);
  expect(response.data.siblings.newer._id).toBe(secondPoll.id);

  // publish the third poll
  thirdPoll.published = true;
  thirdPoll.date = dayjs().subtract(3, 'day').format('YYYY-MM-DD');
  response = await api(`polls/${thirdPoll.id}`, { method: 'PATCH', json: thirdPoll, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();

  // publish the fourth poll
  fourthPoll.published = true;
  fourthPoll.date = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  response = await api(`polls/${fourthPoll.id}`, { method: 'PATCH', json: fourthPoll, headers: getAuthHeader(Leos.jwt) }).json();
  expect(response.success).toBeTruthy();

  // check second poll as Jiri
  response = await bff('polls/the-second-question', { headers: getAuthHeader(Jiri.jwt) }).json();
  expect(response.data._id).toBe(secondPoll.id);
  expect(response.data.info.caption).toBe(secondPoll.text);
  expect(response.data.info.picture).toBe(secondPoll.picture);
  expect(response.data.info.author.id).toBe(Bara._id);
  expect(response.data.info.author.nickname).toBe(Bara.bio.nickname);
  expect(response.data.info.published).toBeTruthy();
  expect(response.data.my_vote).toBe('trivial');
  expect(response.data.votes_count).toBe(5);
  expect(response.data.votes.neutral).toBe(1);
  expect(response.data.votes.trivial).toBe(2);
  expect(response.data.votes.dislike).toBe(1);
  expect(response.data.votes.hate).toBe(1);
  expect(response.data.siblings.older._id).toBe(firstPoll.id);
  expect(response.data.siblings.newer._id).toBe(thirdPoll.id);

  // check third as Bara
  response = await bff(`polls/${thirdPoll.slug}`, { headers: getAuthHeader(Bara.jwt) }).json();
  expect(response.data._id).toBe(thirdPoll.id);
  expect(response.data.my_vote).toBeUndefined();
  expect(response.data.votes_count).toBe(5);
  expect(response.data.votes.neutral).toBe(1);
  expect(response.data.votes.trivial).toBe(2);
  expect(response.data.votes.dislike).toBe(2);
  expect(response.data.votes.hate).toBe(0);
  expect(response.data.siblings.older._id).toBe(secondPoll.id);
  expect(response.data.siblings.newer._id).toBe(fourthPoll.id);

  // check the last poll as anonymous user
  response = await bff(`polls/${fourthPoll.slug}`, { headers: getAuthHeader(Bara.jwt) }).json();
  expect(response.data._id).toBe(fourthPoll.id);
  expect(response.data.siblings.newer).toBe(null);
  expect(response.data.siblings.older._id).toBe(thirdPoll.id);

  // check the last poll as anonymous user
  response = await bff('polls/last').json();
  expect(response.data._id).toBe(fourthPoll.id);
  expect(response.data.my_vote).toBeUndefined();
  expect(response.data.votes_count).toBe(6);
  expect(response.data.votes.neutral).toBe(1);
  expect(response.data.votes.trivial).toBe(1);
  expect(response.data.votes.dislike).toBe(0);
  expect(response.data.votes.hate).toBe(4);

  // check the last poll as Vita
  response = await bff('polls/last', { headers: getAuthHeader(Vita.jwt) }).json();
  expect(response.data._id).toBe(fourthPoll.id);
  expect(response.data.my_vote).toBe('hate');

  // get all polls with default params
  response = await bff('polls/').json();
  expect(response.data.length).toBe(4);
  expect(response.data[0]._id).toBe(fourthPoll.id);
  expect(response.data[1]._id).toBe(thirdPoll.id);
  expect(response.data[2]._id).toBe(secondPoll.id);
  expect(response.data[3]._id).toBe(firstPoll.id);

  // get last two polls
  response = await bff('polls?obd=date&ps=2').json();
  expect(response.data.length).toBe(2);
  expect(response.data[0]._id).toBe(fourthPoll.id);
  expect(response.data[1]._id).toBe(thirdPoll.id);

  // get second and third poll
  response = await bff(`polls?oba=date&ps=2&lr=id:${firstPoll.id}`).json();
  expect(response.data.length).toBe(2);
  expect(response.data[0]._id).toBe(secondPoll.id);
  expect(response.data[1]._id).toBe(thirdPoll.id);

  // get fourth poll
  response = await bff(`polls?obd=date&lr=id:${secondPoll.id}`).json();
  expect(response.data.length).toBe(1);
  expect(response.data[0]._id).toBe(firstPoll.id);

  // get the first poll votes
  response = await bff(`polls/${firstPoll.id}/votes`).json();
  expect(response.success).toBeTruthy();
  expect(response.data.neutral).toBe(2);
  expect(response.data.trivial).toBe(1);
  expect(response.data.dislike).toBe(1);
  expect(response.data.hate).toBe(2);

  // get first poll votes, filter by car
  response = await bff(`polls/${firstPoll.id}/votes?vehicles=car`).json();
  expect(response.success).toBeTruthy();
  expect(response.data.neutral).toBe(1);
  expect(response.data.trivial).toBe(1);
  expect(response.data.dislike).toBe(1);
  expect(response.data.hate).toBe(1);

  // get first poll votes, filter by bike or truck
  response = await bff(`polls/${firstPoll.id}/votes?vehicles=bike&vehicles=truck`).json();
  expect(response.success).toBeTruthy();
  expect(response.data.neutral).toBe(0);
  expect(response.data.trivial).toBe(1);
  expect(response.data.dislike).toBe(1);
  expect(response.data.hate).toBe(1);

  // get first poll votes, filter by woman
  response = await bff(`polls/${firstPoll.id}/votes?sex=woman`).json();
  expect(response.success).toBeTruthy();
  expect(response.data.neutral).toBe(0);
  expect(response.data.trivial).toBe(0);
  expect(response.data.dislike).toBe(0);
  expect(response.data.hate).toBe(2);

  // get first poll votes, filter by man or woman
  response = await bff(`polls/${firstPoll.id}/votes?sex=man&sex=woman`).json();
  expect(response.success).toBeTruthy();
  expect(response.data.neutral).toBe(1);
  expect(response.data.trivial).toBe(1);
  expect(response.data.dislike).toBe(1);
  expect(response.data.hate).toBe(2);

  // get first poll votes, filter by primary or secondary education
  response = await bff(`polls/${firstPoll.id}/votes?edu=primary&edu=secondary`).json();
  expect(response.success).toBeTruthy();
  expect(response.data.neutral).toBe(0);
  expect(response.data.trivial).toBe(1);
  expect(response.data.dislike).toBe(0);
  expect(response.data.hate).toBe(1);

  // get first poll votes, filter by primary, secondary or university education
  response = await bff(`polls/${firstPoll.id}/votes?edu=primary&edu=secondary&edu=university`).json();
  expect(response.success).toBeTruthy();
  expect(response.data.neutral).toBe(1);
  expect(response.data.trivial).toBe(1);
  expect(response.data.dislike).toBe(1);
  expect(response.data.hate).toBe(2);

  // get first poll votes, filter by PRG region
  response = await bff(`polls/${firstPoll.id}/votes?region=PRG`).json();
  expect(response.success).toBeTruthy();
  expect(response.data.neutral).toBe(1);
  expect(response.data.trivial).toBe(0);
  expect(response.data.dislike).toBe(0);
  expect(response.data.hate).toBe(1);

  // get first poll votes, filter by age under 30
  response = await bff(`polls/${firstPoll.id}/votes?age=0:30`).json();
  expect(response.success).toBeTruthy();
  expect(response.data.neutral).toBe(0);
  expect(response.data.trivial).toBe(0);
  expect(response.data.dislike).toBe(0);
  expect(response.data.hate).toBe(2);

  // get first poll votes, filter by age 40-42
  response = await bff(`polls/${firstPoll.id}/votes?age=40:43`).json();
  expect(response.success).toBeTruthy();
  expect(response.data.neutral).toBe(0);
  expect(response.data.trivial).toBe(1);
  expect(response.data.dislike).toBe(1);
  expect(response.data.hate).toBe(0);

  // get first poll votes, filter by driving 10-20 years
  response = await bff(`polls/${firstPoll.id}/votes?driving=10:21`).json();
  expect(response.success).toBeTruthy();
  expect(response.data.neutral).toBe(1);
  expect(response.data.trivial).toBe(0);
  expect(response.data.dislike).toBe(1);
  expect(response.data.hate).toBe(0);

  // get first poll votes, filter by car or bike, driving >= 10 years, region PRG or MS, university degree
  response = await bff(`polls/${firstPoll.id}/votes?vehicles=bike&vehicles=car&driving=10:99&region=PRG&region=MS&edu=university`).json();
  expect(response.data.neutral).toBe(1);
  expect(response.data.trivial).toBe(0);
  expect(response.data.dislike).toBe(0);
  expect(response.data.hate).toBe(0);

  done();
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
  await resetHonors(dbClient);
});

afterAll(() => {
  mongo.close();
  server.close();
  logger.info('Server stopped');
});
