const { api } = require('./testUtils');
const app = require('../src/server');
const { log } = require('../src/utils/logging');

let server;

test('Status API', () => api('status').json().then(
  (data) => {
    expect(data).toBeDefined();
  },
));

beforeAll(async () => {
  server = app.listen(3000, () => log.info('Server started'));
});

afterAll(() => {
  server.close();
  log.info('Server stopped');
});
