const axios = require('axios').default;
const dotenv = require('dotenv');
const app = require('../src/server.js');
dotenv.config({ path: 'C:\\dev\\mezinamiridici\\infrastructure\\.test.env' });

axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
axios.defaults.headers.patch['Content-Type'] = 'application/json; charset=utf-8';

test('end to end test', async () => {
    const polls = await axios.get(`http://localhost:3000/bff/polls/last`);
    expect(polls.data).toBeDefined();
});

beforeAll(() => {
    app.listen(3000, '0.0.0.0')
        .then(r => console.log("Server started"));
});

afterAll(() => {
    if (app.close())
        console.log("Server stopped");
});
