const got = require('got');
const api = got.extend({
    prefixUrl: 'http://localhost:3000/v1/',
    headers: {
        "content-type": "application/json"
    },
});
const bff = got.extend({
    prefixUrl: 'http://localhost:3000/bff/',
    headers: {
        "content-type": "application/json"
    },
});
// const axios = require('axios').default;
// axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
// axios.defaults.headers.patch['Content-Type'] = 'application/json; charset=utf-8';
const dotenv = require('dotenv');
dotenv.config({ path: 'C:\\dev\\mezinamiridici\\infrastructure\\.test.env' });
const jwt = require('jsonwebtoken');
const mongo = require('../src/utils/mongo.js');
const logger = require("../src/utils/logging");
const app = require('../src/server.js');
// const API = "http://192.168.157.241:3000/v1", BFF = "http://192.168.157.241:3000/bff";
// const API = "http://localhost:3000/v1", BFF = "http://localhost:3000/bff";

describe("user accounts", () => {
    test("create user", async () => {
        let body = {
            email: "leos@email.bud",
            password: "StupidPassword",
            nickname: "leos",
            termsAndConditions: true,
            dataProcessing: true,
            marketing: true,
        };
        let response = await api(`users`, { method: "POST",body: JSON.stringify(body) }).json();

        expect(response.success).toBeTruthy();
        expect(response.data).toBeDefined();
        let jwtData = response.data;
        let jwtDecoded = jwt.decode(jwtData);
        expect(jwtDecoded.nickname).toMatch("leos");

        response = await api(`users/${jwtDecoded.userId}`, getAuthHeader(jwtData)).json();
        expect(response.success).toBeTruthy();
        expect(response.data).toBeDefined();
        let profile = response.data;
        console.log(profile);
        expect(profile.bio.nickname).toMatch("leos");

        /*
                response = await axios.get(`${API}/users/${jwtDecoded.userId}`);
                expect(response.data.success).toBeTruthy();
                expect(response.data.data).toBeDefined();
                profile = response.data.data;
                expect(profile.auth.email).toBeUndefined();
        */

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
