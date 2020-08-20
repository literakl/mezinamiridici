const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(__dirname, '..', '.test.env');
dotenv.config({ path: envPath });

const jwt = require('jsonwebtoken');
const mongo = require('../src/utils/mongo.js');
const logger = require('../src/utils/logging');
const auth = require('../src/utils/authenticate');
const app = require('../src/server.js');
const dayjs = require('dayjs');
const {
  api, bff, getAuthHeader,
} = require('./testUtils');
const {
  setup, Leos, Jiri, Lukas, Vita, Jana, Bara,
} = require('./prepareUsers');
const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const schedule = require('../src/utils/scheduleService');


let dbClient;
let server;

test('User API', async (done) => {
  jest.setTimeout(60000);

  // create user
  let body = {
    email: 'leos@email.bud',
    password: 'StupidPassword',
    nickname: 'leos',
    termsAndConditions: true,
    dataProcessing: true,
    emails: true,
  };
  let response = await api('users', { method: 'POST', json: body }).json();
  expect(response.success).toBeTruthy();
  expect(response.data).toBeDefined();
  let jwtData = response.data;
  const jwtDecoded = jwt.decode(jwtData);
  const { userId } = jwtDecoded;
  expect(jwtDecoded.nickname).toBe('leos');

  // create duplicate user
  response = await api('users', { method: 'POST', json: body });
  expect(response.statusCode).toBe(409);

  // create duplicate user
  body.email = 'no@email.bud';
  response = await api('users', { method: 'POST', json: body });
  expect(response.statusCode).toBe(409);

  // missing T&C
  delete body.termsAndConditions;
  response = await api('users', { method: 'POST', json: body });
  expect(response.statusCode).toBe(400);

  // missing email
  delete body.email;
  response = await api('users', { method: 'POST', json: body });
  expect(response.statusCode).toBe(400);

  // sign in before verification
  body = {
    email: 'leos@email.bud',
    password: 'StupidPassword',
  };
  response = await api('authorizeUser', { method: 'POST', json: body });
  expect(response.statusCode).toBe(403);

  // sign in without email
  delete body.email;
  response = await api('authorizeUser', { method: 'POST', json: body });
  expect(response.statusCode).toBe(400);

  // update user with data, private profile
  body = {
    drivingSince: 2007,
    vehicles: ['car'],
    sex: 'man',
    born: 1974,
    region: 'PRG',
    education: 'university',
    publicProfile: false,
  };
  response = await api(`users/${userId}`, { method: 'PATCH', json: body, headers: getAuthHeader(jwtData) }).json();
  expect(response.success).toBeTruthy();

  // get the user profile as anonymous user
  response = await api(`users/${userId}`).json();
  expect(response.success).toBeTruthy();
  expect(response.data).toBeDefined();
  let profile = response.data;
  expect(profile.bio.nickname).toBe('leos');
  expect(profile.bio.sex).toBeUndefined();
  expect(profile.bio.born).toBeUndefined();
  expect(profile.bio.region).toBeUndefined();
  expect(profile.bio.edu).toBeUndefined();
  expect(profile.driving.since).toBeUndefined();
  expect(profile.driving.vehicles).toBeUndefined();

  // get my user profile as logged user
  response = await api(`users/${userId}`, { headers: getAuthHeader(jwtData) }).json();
  expect(response.success).toBeTruthy();
  expect(response.data).toBeDefined();
  profile = response.data;
  expect(profile.bio.sex).toBe('man');
  expect(profile.bio.born).toBe(1974);
  expect(profile.bio.region).toBe('PRG');
  expect(profile.bio.edu).toBe('university');
  expect(profile.driving.since).toBe(2007);
  expect(profile.driving.vehicles).toStrictEqual(['car']);

  // set the profile to be public, update some fields
  body = {
    vehicles: ['car', 'bike'],
    born: 1975,
    region: 'MS',
    publicProfile: true,
  };
  response = await api(`users/${userId}`, { method: 'PATCH', json: body, headers: getAuthHeader(jwtData) }).json();
  expect(response.success).toBeTruthy();

  // get the user profile as anonymous user
  response = await api(`users/${userId}`).json();
  expect(response.success).toBeTruthy();
  expect(response.data).toBeDefined();
  profile = response.data;
  expect(profile.bio.sex).toBeUndefined();
  expect(profile.bio.born).toBe(1975);
  expect(profile.bio.region).toBe('MS');
  expect(profile.bio.edu).toBeUndefined();
  expect(profile.driving.since).toBeUndefined();
  expect(profile.driving.vehicles).toStrictEqual(['car', 'bike']);

  // verify account
  profile = await mongo.findUser(dbClient, { userId });
  response = await api(`verify/${profile.auth.verifyToken}`, { method: 'POST' }).json();
  expect(response.success).toBeTruthy();

  // token is not valid anymore
  response = await api(`verify/${profile.auth.verifyToken}`, { method: 'POST' });
  expect(response.statusCode).toBe(403);

  // reset password
  body = {
    email: 'leos@email.bud',
  };
  response = await api('forgotPassword', { method: 'POST', json: body }).json();
  expect(response.success).toBeTruthy();
  profile = await mongo.findUser(dbClient, { userId });
  body = {
    resetPasswordToken: profile.auth.reset.token,
    password: 'BadPassword',
  };
  response = await api('resetPassword', { method: 'POST', json: body }).json();
  expect(response.success).toBeTruthy();

  // sign in
  body = {
    email: 'leos@email.bud',
    password: 'BadPassword',
  };
  response = await api('authorizeUser', { method: 'POST', json: body }).json();
  expect(response.success).toBeTruthy();
  expect(response.data).toBeDefined();
  jwtData = response.data;
  expect(jwt.decode(jwtData).nickname).toBe('leos');

  // change password, wrong current password
  body = {
    currentPassword: 'WrongPassword',
    newPassword: 'UglyPassword',
  };
  response = await api(`users/${userId}/password`, { method: 'PATCH', json: body, headers: getAuthHeader(jwtData) });
  expect(response.statusCode).toBe(403);

  // change password
  body.currentPassword = 'BadPassword';
  response = await api(`users/${userId}/password`, { method: 'PATCH', json: body, headers: getAuthHeader(jwtData) }).json();
  expect(response.success).toBeTruthy();
  expect(response.data).toBeDefined();

  // sign in with old password
  body = {
    email: 'leos@email.bud',
    password: 'BadPassword',
  };
  response = await api('authorizeUser', { method: 'POST', json: body });
  expect(response.statusCode).toBe(403);

  // sign in with wrong user
  body.email = 'leos@email.bus';
  response = await api('authorizeUser', { method: 'POST', json: body });
  expect(response.statusCode).toBe(403);

  // sign in with new password
  body.email = 'leos@email.bud';
  body.password = 'UglyPassword';
  response = await api('authorizeUser', { method: 'POST', json: body }).json();
  expect(response.success).toBeTruthy();
  expect(response.data).toBeDefined();
  jwtData = response.data;

  // validate obsolete token
  const token = auth.createToken(userId, 'leos', new Date(2019), true, null, '1m');
  response = await api(`users/${userId}/validateToken`, { method: 'POST', json: {}, headers: getAuthHeader(token) });
  expect(response.statusCode).toBe(403);

  // validate invalid token
  response = await api(`users/${userId}/validateToken`, { method: 'POST', json: {}, headers: getAuthHeader('Invalid') });
  expect(response.statusCode).toBe(500);

  // validate token
  response = await api(`users/${userId}/validateToken`, { method: 'POST', json: {}, headers: getAuthHeader(jwtData) }).json();
  expect(response.success).toBeTruthy();
  expect(response.data).toBeDefined();

  done();
});

test('CORS', async (done) => {
  let response = await api('authorizeUser', { method: 'OPTIONS' });
  expect(response.statusCode).toBe(200);
  response = await api('resetPassword', { method: 'OPTIONS' });
  expect(response.statusCode).toBe(200);
  response = await api('forgotPassword', { method: 'OPTIONS' });
  expect(response.statusCode).toBe(200);
  response = await api('verify/:token', { method: 'OPTIONS' });
  expect(response.statusCode).toBe(200);
  response = await api('users', { method: 'OPTIONS' });
  expect(response.statusCode).toBe(200);
  response = await api('users/XXX', { method: 'OPTIONS' });
  expect(response.statusCode).toBe(200);
  response = await api('users/XXX/password', { method: 'OPTIONS' });
  expect(response.statusCode).toBe(200);
  response = await api('users/XXX/validateToken', { method: 'OPTIONS' });
  expect(response.statusCode).toBe(200);

  done();
});

test('User Rank', async (done) => {
  jest.setTimeout(180 * 60000);

  const pollBody = {
    text: 'First question',
    picture: 'picture.png',
    date: dayjs().subtract(7, 'hour').format('YYYY-MM-DD'),
  };
  const poll = await api('polls', { method: 'POST', json: pollBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(poll.success).toBeTruthy();

  const commentBody = {
    text: 'Comment 1',
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

  commentBody.text = 'Comment 2';
  const comment2 = await api(`items/${poll.data._id}/comments`, { method: 'POST', json: commentBody, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(comment2.success).toBeTruthy();

  voteResponse = await api(`comments/${comment2.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Leos.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteResponse = await api(`comments/${comment2.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(voteResponse.success).toBeFalsy();
  voteResponse = await api(`comments/${comment2.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Vita.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();
  voteResponse = await api(`comments/${comment2.data.comment._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Lukas.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();

  voteResponse = await bff(`polls/${poll.data._id}/votes`, { method: 'POST', json: voteBody, headers: getAuthHeader(Jiri.jwt) }).json();
  expect(voteResponse.success).toBeTruthy();
  
  const jwtDecoded = jwt.decode(Jiri.jwt);
  const { userId } = jwtDecoded;
  const shareBody = {
    path: `/anketa/${poll.data.info.slug}`,
    service: 'twitter',
    userId
  }

  let shareResponse = await api(`items/${poll.data._id}/share`,{ method: 'POST', json: shareBody, headers: getAuthHeader(Leos.jwt) }).json();
  const sendUrl = `http://www.twitter.com/share?url=${process.env.WEB_URL + shareBody.path}`;
  expect(shareResponse.success).toBeTruthy();
  expect(shareResponse.data).toBe(sendUrl);

  await schedule();

  setTimeout(async () => {

    let checkUser = await api(`users/${userId}`,{ method: 'GET' }).json();
    expect(checkUser.data.honors.rank).toBe('student');
    done();
    
  },10000);
})

beforeEach(async () => {
  await dbClient.db().collection('users').deleteMany({});
  await dbClient.db().collection('comments').deleteMany({});
  await dbClient.db().collection('items').deleteMany({});
  await dbClient.db().collection('poll_votes').deleteMany({});
  await dbClient.db().collection('comment_votes').deleteMany({});
  await dbClient.db().collection('link_shares').deleteMany({});
  await setup(dbClient, api);
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
