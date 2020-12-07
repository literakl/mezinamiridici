const baseYear = 2020, currentYear = new Date().getFullYear(), diff = currentYear - baseYear;

function fix(year) { return year + diff; }

const Leos = {
  _id: 'leos',
  auth: {
    email: 'leos@email.bud',
    pwdHash: '$2a$10$EgZrIC7jmLGatzhLZeolAuJzL1peobCO5sTUIYa1c2XKNCRRNd2WO',
    pwdTimestamp: new Date(),
    verified: true,
  },
  bio: {
    nickname: 'literakl', born: fix(1975), edu: 'university', region: 'PRG', sex: 'man', registered: new Date(),
  },
  driving: { since: fix(2007), vehicles: ['car'] },
  prefs: { public: true },
  honors: {
    rank: 'novice',
    count: { pollVotes: 0, comments: 4, commentVotes: 0, commentVoteRatio: 25, blogs: 0, shares: 0, sharingWeeks: 0 },
  },
  consent: { terms: new Date(), data: new Date() },
  roles: ['admin:poll', 'admin:pages'],
};
const Jiri = {
  _id: 'jiri',
  auth: {
    email: 'jiri@email.bud',
    pwdHash: '$2a$10$EgZrIC7jmLGatzhLZeolAuJzL1peobCO5sTUIYa1c2XKNCRRNd2WO',
    pwdTimestamp: new Date(),
    verified: true,
  },
  bio: {
    nickname: 'jirka', born: fix(1978), edu: 'primary', region: 'MS', sex: 'man', registered: new Date(),
  },
  driving: { since: fix(1996), vehicles: ['bike', 'car'] },
  prefs: { public: true },
  honors: {
    rank: 'expert',
    count: { pollVotes: 10, comments: 100, commentVotes: 50, commentVoteRatio: 90, blogs: 20, shares: 250, sharingWeeks: 30 },
  },
  consent: { terms: new Date(), data: new Date() },
};
const Lukas = {
  _id: 'lukas',
  auth: {
    email: 'lukas@email.bud',
    pwdHash: '$2a$10$EgZrIC7jmLGatzhLZeolAuJzL1peobCO5sTUIYa1c2XKNCRRNd2WO',
    pwdTimestamp: new Date(),
    verified: true,
  },
  bio: { nickname: 'Lukáš', region: 'OLM', registered: new Date() },
  driving: {},
  prefs: { public: false },
  honors: {
    rank: 'graduate',
    sharingWeeksList: [[23, true], [24, false], [25, true], [26, true], [27, true], [28, false], [29, true], [30, true], [31, true], [32, false]],
    count: { pollVotes: 5, comments: 20, commentVotes: 30, commentVoteRatio: 80, blogs: 2, shares: 30, sharingWeeks: 15 },
  },
  consent: { terms: new Date(), data: new Date() },
};
const Vita = {
  _id: 'vita',
  auth: {
    email: 'vita@email.bud',
    pwdHash: '$2a$10$EgZrIC7jmLGatzhLZeolAuJzL1peobCO5sTUIYa1c2XKNCRRNd2WO',
    pwdTimestamp: new Date(),
    verified: true,
  },
  bio: {
    nickname: 'Víťa', born: fix(1980), edu: 'university', region: 'JM', sex: 'man', registered: new Date(),
  },
  driving: { since: fix(2000), vehicles: ['bike', 'car', 'van'] },
  prefs: { public: true },
  honors: {
    rank: 'student',
    count: { pollVotes: 2, comments: 2, commentVotes: 10, blogs: 1, shares: 4, sharingWeeks: 3 },
  },
  consent: { terms: new Date(), data: new Date() },
};
const Jana = {
  _id: 'jana',
  auth: {
    email: 'jana@email.bud',
    pwdHash: '$2a$10$EgZrIC7jmLGatzhLZeolAuJzL1peobCO5sTUIYa1c2XKNCRRNd2WO',
    pwdTimestamp: new Date(),
    verified: true,
  },
  bio: {
    nickname: 'Jana', born: fix(2000), edu: 'secondary', region: 'SC', sex: 'woman', registered: new Date(),
  },
  driving: { since: fix(2018), vehicles: ['car'] },
  prefs: { public: true },
  honors: {
    rank: 'novice',
    count: { pollVotes: 0, comments: 0, commentVotes: 0, blogs: 0, shares: 0, sharingWeeks: 0 },
  },
  consent: { terms: new Date(), data: new Date() },
};
const Bara = {
  _id: 'bara',
  auth: {
    email: 'bara@email.bud',
    pwdHash: '$2a$10$EgZrIC7jmLGatzhLZeolAuJzL1peobCO5sTUIYa1c2XKNCRRNd2WO',
    pwdTimestamp: new Date(),
    verified: true,
  },
  bio: {
    nickname: 'Barbora', born: fix(1995), edu: 'university', region: 'PRG', sex: 'woman', registered: new Date(),
  },
  driving: { since: fix(2019), vehicles: ['bus', 'truck', 'tramway'] },
  prefs: { public: true },
  honors: {
    rank: 'novice',
    count: { pollVotes: 1, comments: 10, commentVotes: 20, commentVoteRatio: 66, blogs: 2, shares: 7, sharingWeeks: 5 },
  },
  consent: { terms: new Date(), data: new Date() },
};

async function setup(dbClient, api) {
  const db = dbClient.db();
  await db.collection('users').deleteMany({});
  await db.collection('users').insertMany([Leos, Jiri, Lukas, Vita, Jana, Bara]);

  const body = {
    email: 'vita@email.bud',
    password: 'BadPassword',
  };

  let response = await api('authorizeUser', { method: 'POST', json: body }).json();
  Vita.jwt = response.data;

  body.email = 'leos@email.bud';
  response = await api('authorizeUser', { method: 'POST', json: body }).json();
  Leos.jwt = response.data;

  body.email = 'jiri@email.bud';
  response = await api('authorizeUser', { method: 'POST', json: body }).json();
  Jiri.jwt = response.data;

  body.email = 'lukas@email.bud';
  response = await api('authorizeUser', { method: 'POST', json: body }).json();
  Lukas.jwt = response.data;

  body.email = 'jana@email.bud';
  response = await api('authorizeUser', { method: 'POST', json: body }).json();
  Jana.jwt = response.data;

  body.email = 'bara@email.bud';
  response = await api('authorizeUser', { method: 'POST', json: body }).json();
  Bara.jwt = response.data;
}

module.exports = {
  setup, Leos, Jiri, Lukas, Vita, Jana, Bara,
};
