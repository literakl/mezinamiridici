const { api } = require('./testUtils');
const app = require('../src/server.js');
const { logger } = require('../src/utils/logging');

let server;

test('Status API', () => api('status').json().then(
  (data) => {
    expect(data).toBeDefined();
  },
));

beforeAll(async () => {
  server = app.listen(3000, () => logger.info('Server started'));
});

afterAll(() => {
  server.close();
  logger.info('Server stopped');
});
