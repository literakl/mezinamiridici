const axios = require('axios').default;
axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
axios.defaults.headers.patch['Content-Type'] = 'application/json; charset=utf-8';
const dotenv = require('dotenv');
dotenv.config({ path: 'C:\\dev\\mezinamiridici\\infrastructure\\.test.env' });
const jsonwebtoken = require('jsonwebtoken');
const mongo = require('../src/utils/mongo.js');
const logger = require("../src/utils/logging");
const app = require('../src/server.js');
const API = "http://192.168.157.241:3000/v1", BFF = "http://192.168.157.241:3000/bff";
// const API = "http://localhost:3000/v1", BFF = "http://localhost:3000/bff";

describe("user accounts", () => {
    test('create user', async () => {
        let response = await axios.post(`${API}/users`, {
            email: "leos@email.bud",
            password: "StupidPassword",
            nickname: "leos",
            termsAndConditions: true,
            dataProcessing: true,
            marketing: true,
        })
        expect(response.data.success).toBeTruthy();
        expect(response.data.data).toBeDefined();
        let jwt = response.data.data;
        let jwtData = jsonwebtoken.decode(jwt);
        expect(jwtData.nickname).toMatch("leos");
        console.log(jwt);
        console.log(jwtData);

        // response = await axios.get(`${API}/users/${jwtData.userId}`);
        response = await axios.get(`${API}/users/${jwtData.userId}`, getAuthHeader(jwt)); // TODO error with Authorization header
        expect(response.data.success).toBeTruthy();
        expect(response.data.data).toBeDefined();
        let profile = response.data.data;
        expect(profile.bio.nickname).toMatch("leos");
        expect(profile.auth.email).toMatch("leos@email.bud");

        response = await axios.get(`${API}/users/${jwtData.userId}`);
        expect(response.data.success).toBeTruthy();
        expect(response.data.data).toBeDefined();
        profile = response.data.data;
        expect(profile.auth.email).toBeUndefined();

/*
        response = await axios.patch(`${API}/users/${jwtData.userId}`, {
            drivingSince: 2007,
            vehicles: ["car"],
            sex: "man",
            born: "1975",
            region: "PRG",
            education: "university",
            publicProfile: true,
        }, getAuthHeader(jwt));
        expect(response.data.success).toBeTruthy();*/
    });

    beforeEach(async () => {
        const dbClient = await mongo.connectToDatabase();
        await dbClient.db().collection("users").deleteMany({});
    });
});

function getAuthHeader(jwt) {
    const config = { headers: { } };
    if (jwt) {
        config.headers.Authorization = `bearer ${jwt}`;
    }
    return config;
}

beforeAll(() => {
    app.listen(3000, '0.0.0.0')
        .then(r => logger.info("Server started"));
});

afterAll(() => {
    if (app.close())
        logger.info("Server stopped");
});
