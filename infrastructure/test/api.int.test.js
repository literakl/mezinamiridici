const axios = require('axios').default;
const dotenv = require('dotenv');
const app = require('../src/server.js');
dotenv.config({ path: 'C:\\dev\\mezinamiridici\\infrastructure\\.test.env' });

axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
axios.defaults.headers.patch['Content-Type'] = 'application/json; charset=utf-8';

function sum(a, b) {
    return a * b;
}

test('end to end test', () => {
    const polls = axios.get(`http://127.0.0.1:3000/bff//polls/last`);
    expect(polls).toBeFalsy();
});

beforeAll(() => {
    app.listen(3000, '0.0.0.0')
        .then(r => console.log("Server started"));
});

afterAll(() => {
    if (app.close())
        console.log("Server stopped");
});
