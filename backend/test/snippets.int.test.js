const dotenv = require('dotenv');
const dayjs = require('dayjs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.test.env');
dotenv.config({ path: envPath });

const mongo = require('../src/utils/mongo.js');
const { logger } = require('../src/utils/logging');
const app = require('../src/server.js');

const {
  api,
} = require('./testUtils');
const {
  setup,
} = require('./prepareUsers');

let dbClient, server;

test('Item snippets', async (done) => {
  await setup(dbClient, api);
  jest.setTimeout(180 * 60000);

  /*
  1. create blog as Vita
  2. get snippets as Jiri - forbidden (missing role staffer)
  2. get snippets as Lukas - forbidden (different user than owner)
  2. get snippets as Vita - empty
  3. create snippet A as Jiri - forbidden (missing role editor in chief)
  3. create snippet A as Vita - forbidden (missing role editor in chief)
  3. create snippet A as Leos
  4. create snippet C as Leos
  5. get snippets - A,C as Vita
  6. rename snippet C to B as Leos
  7. add snippet D as Leos
  8. remove snippet A as Leos
  9. get snippets - B,D as Vita
  */

  done();
});

beforeEach(async () => {
  const db = dbClient.db();
  await db.collection('users').deleteMany({});
  await db.collection('items').deleteMany({});
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
