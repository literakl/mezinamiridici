const axios = require('axios').default;
axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
axios.defaults.headers.patch['Content-Type'] = 'application/json; charset=utf-8';
const dotenv = require('dotenv');
dotenv.config({ path: 'C:\\dev\\mezinamiridici\\infrastructure\\.test.env' });
const logger = require("../src/utils/logging");
const app = require('../src/server.js');

test('end to end test', async () => {
    const polls = await axios.get(`http://localhost:3000/bff/polls/last`);
    console.log(polls.data);
    expect(polls.data).toBeDefined();
});

beforeAll(() => {
    app.listen(3000, '0.0.0.0')
        .then(r => logger.info("Server started"));
});

afterAll(() => {
    if (app.close())
        logger.info("Server stopped");
});
