const baseYear = 2020, currentYear = new Date().getFullYear(), diff = currentYear - baseYear;

function fix(year) { return year + diff; }

const Leos = {
  _id: '1e40v0b1j5',
  auth: {
    email: 'leos@email.bud',
    pwdHash: '$2a$10$EgZrIC7jmLGatzhLZeolAuJzL1peobCO5sTUIYa1c2XKNCRRNd2WO',
    pwdTimestamp: new Date(),
    verified: true,
  },
  bio: {
    nickname: 'literakl', born: fix(1975), edu: 'university', region: 'PRG', sex: 'man',
  },
  driving: { since: fix(2007), vehicles: ['car'] },
  prefs: { public: true },
  consent: { terms: new Date(), data: new Date() },
  roles: ['admin:poll'],
};
const Jiri = {
  _id: '1e416vocls',
  auth: {
    email: 'jiri@email.bud',
    pwdHash: '$2a$10$EgZrIC7jmLGatzhLZeolAuJzL1peobCO5sTUIYa1c2XKNCRRNd2WO',
    pwdTimestamp: new Date(),
    verified: true,
  },
  bio: {
    nickname: 'jirka', born: fix(1978), edu: 'primary', region: 'MS', sex: 'man',
  },
  driving: { since: fix(1996), vehicles: ['bike', 'car'] },
  prefs: { public: true },
  consent: { terms: new Date(), data: new Date() },
};
const Lukas = {
  _id: '1e4176ttr8',
  auth: {
    email: 'lukas@email.bud',
    pwdHash: '$2a$10$EgZrIC7jmLGatzhLZeolAuJzL1peobCO5sTUIYa1c2XKNCRRNd2WO',
    pwdTimestamp: new Date(),
    verified: true,
  },
  bio: { nickname: 'Lukáš', region: 'OLM' },
  driving: {},
  prefs: { public: false },
  consent: { terms: new Date(), data: new Date() },
};
const Vita = {
  _id: '1e41795qjw',
  auth: {
    email: 'vita@email.bud',
    pwdHash: '$2a$10$EgZrIC7jmLGatzhLZeolAuJzL1peobCO5sTUIYa1c2XKNCRRNd2WO',
    pwdTimestamp: new Date(),
    verified: true,
  },
  bio: {
    nickname: 'Víťa', born: fix(1980), edu: 'university', region: 'JM', sex: 'man',
  },
  driving: { since: fix(2000), vehicles: ['bike', 'car', 'van'] },
  prefs: { public: true },
  consent: { terms: new Date(), data: new Date() },
};
const Jana = {
  _id: '1e417bgivc',
  auth: {
    email: 'jana@email.bud',
    pwdHash: '$2a$10$EgZrIC7jmLGatzhLZeolAuJzL1peobCO5sTUIYa1c2XKNCRRNd2WO',
    pwdTimestamp: new Date(),
    verified: true,
  },
  bio: {
    nickname: 'Jana', born: fix(2000), edu: 'secondary', region: 'SC', sex: 'woman',
  },
  driving: { since: fix(2018), vehicles: ['car'] },
  prefs: { public: true },
  consent: { terms: new Date(), data: new Date() },
};
const Bara = {
  _id: '1e417edlqb',
  auth: {
    email: 'bara@email.bud',
    pwdHash: '$2a$10$EgZrIC7jmLGatzhLZeolAuJzL1peobCO5sTUIYa1c2XKNCRRNd2WO',
    pwdTimestamp: new Date(),
    verified: true,
  },
  bio: {
    nickname: 'Barbora', born: fix(1995), edu: 'university', region: 'PRG', sex: 'woman',
  },
  driving: { since: fix(2019), vehicles: ['bus', 'truck', 'tramway'] },
  prefs: { public: true },
  consent: { terms: new Date(), data: new Date() },
};

async function setup(dbClient, api) {
  await dbClient.db().collection('users').deleteMany({});
  await dbClient.db().collection('users').insertMany([Leos, Jiri, Lukas, Vita, Jana, Bara]);

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
