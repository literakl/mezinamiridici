const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');

const envPath = path.join(__dirname, '..', '.test.env');
dotenv.config({ path: envPath });

const mongo = require('../src/utils/mongo.js');
const { logger } = require('../src/utils/logging');
const auth = require('../src/utils/authenticate');
const app = require('../src/server.js');
const { handleSocialProviderResponse } = require('../src/handlers/users/socialAction');

const {
  api, bff, getAuthHeader,
} = require('./testUtils');

let dbClient, server;

class ResponseMock {
  statusCode;

  headers = [];

  body;

  status(s) {
    this.statusCode = s;
  }

  setHeader(header, value) {
    this.headers.push(`${header}: ${value}`);
  }

  send(s) {
    this.body = s;
  }
}

test('User API', async (done) => {
  jest.setTimeout(120000);

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
  let jwtDecoded = jwt.decode(jwtData);
  let { userId } = jwtDecoded;
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
    urls: ['', 'https://github.com/literakl/', ''],
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
  expect(profile.bio.urls).toStrictEqual(['https://github.com/literakl/']);
  expect(profile.driving.since).toBeUndefined();
  expect(profile.driving.vehicles).toStrictEqual(['car', 'bike']);

  // check XSS in URLs
  // eslint-disable-next-line no-script-url
  body.urls = ['https://github.com/literakl/', 'javascript:alert(11);'];
  response = await api(`users/${userId}`, { method: 'PATCH', json: body, headers: getAuthHeader(jwtData) });
  expect(response.statusCode).toBe(500); // Forbidden would be better

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

  // get the user info
  response = await bff(`users/${userId}/info`).json();
  expect(response.success).toBeTruthy();
  expect(response.data).toBeDefined();
  const info = response.data;
  expect(info.bio.sex).toBeUndefined();
  expect(info.bio.nickname).toBe('leos');
  expect(info.bio.registered).toBeDefined();
  expect(info.honors).toBeDefined();
  expect(info.honors.rank).toBe('novice');
  expect(info.honors.count).toBeDefined();

  // check user id made with nickname
  body = {
    email: 'cremebrulee@email.bud',
    password: 'StupidPassword',
    nickname: 'Crème Brulée12345678/*-+!@#$%^&*()_+=<script>?🤩 Star-Struck Leoš Literák',
    termsAndConditions: true,
    dataProcessing: true,
    emails: true,
  };

  response = await api('users', { method: 'POST', json: body }).json();
  jwtData = response.data;
  const jwtDecodedOther = jwt.decode(jwtData);
  expect(jwtDecodedOther.userId).toBe('CremeBruleescriptStarStruckLeosLiterak');

  // sign in user via Facebook
  body = { email: 'leos@literak.bud', name: 'Leoš Literák', provider: 'facebook' };
  response = await handleSocialProviderResponse(body, new ResponseMock());
  expect(response.statusCode).toBe(201);
  body = {
    email: response.body.email,
    nickname: response.body.name,
    socialId: response.body.socialId,
    termsAndConditions: true,
    dataProcessing: true,
    emails: true,
  };
  response = await api('users', { method: 'POST', json: body }).json();
  expect(response.success).toBeTruthy();
  jwtData = response.data;
  jwtDecoded = jwt.decode(jwtData);
  // eslint-disable-next-line prefer-destructuring
  userId = jwtDecoded.userId;

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

beforeEach(async () => {
  const db = dbClient.db();
  await db.collection('users').deleteMany({});
  await db.collection('social_login').deleteMany({});
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
