const got = require('got');
const api = got.extend({
    prefixUrl: 'http://localhost:3000/v1/',
    headers: {
        "content-type": "application/json; charset=utf-8'"
    },
});
const bff = got.extend({
    prefixUrl: 'http://localhost:3000/bff/',
    headers: {
        "content-type": "application/json; charset=utf-8'"
    },
});
const dotenv = require('dotenv');
dotenv.config({ path: 'C:\\dev\\mezinamiridici\\infrastructure\\.test.env' });
const jwt = require('jsonwebtoken');
const mongo = require('../src/utils/mongo.js');
const logger = require("../src/utils/logging");
const app = require('../src/server.js');

describe("user accounts", () => {
    test("create user", async () => {
        // create user
        let body = {
            email: "leos@email.bud",
            password: "StupidPassword",
            nickname: "leos",
            termsAndConditions: true,
            dataProcessing: true,
            marketing: true,
        };
        let response = await api("users", { method: "POST", json: body }).json();
        expect(response.success).toBeTruthy();
        expect(response.data).toBeDefined();
        let jwtData = response.data;
        let jwtDecoded = jwt.decode(jwtData);
        expect(jwtDecoded.nickname).toBe("leos");

        // update user with data, private profile
        body = {
            drivingSince: 2007,
            vehicles: ["car"],
            sex: "man",
            born: 1974,
            region: "PRG",
            education: "university",
            publicProfile: false,
        };
        response = await api(`users/${jwtDecoded.userId}`, { method: 'PATCH', json: body, headers: getAuthHeader(jwtData) }).json();
        expect(response.success).toBeTruthy();

        // get the user profile as anonymous user
        response = await api(`users/${jwtDecoded.userId}`).json();
        expect(response.success).toBeTruthy();
        expect(response.data).toBeDefined();
        let profile = response.data;
        expect(profile.bio.nickname).toBe("leos");
        expect(profile.bio.sex).toBeUndefined();
        expect(profile.bio.born).toBeUndefined();
        expect(profile.bio.region).toBeUndefined();
        expect(profile.bio.edu).toBeUndefined();
        expect(profile.driving.since).toBeUndefined();
        expect(profile.driving.vehicles).toBeUndefined();

        // get my user profile as logged user
        response = await api(`users/${jwtDecoded.userId}`, { headers: getAuthHeader(jwtData) }).json();
        expect(response.success).toBeTruthy();
        expect(response.data).toBeDefined();
        profile = response.data;
        expect(profile.bio.sex).toBe("man");
        expect(profile.bio.born).toBe(1974);
        expect(profile.bio.region).toBe("PRG");
        expect(profile.bio.edu).toBe("university");
        expect(profile.driving.since).toBe(2007);
        expect(profile.driving.vehicles).toStrictEqual(["car"]);

        // set the profile to be public, update some fields
        body = {
            vehicles: ["car", "bike"],
            born: 1975,
            region: "MS",
            publicProfile: true,
        };
        response = await api(`users/${jwtDecoded.userId}`, { method: 'PATCH', json: body, headers: getAuthHeader(jwtData) }).json();
        expect(response.success).toBeTruthy();

        // get the user profile as anonymous user
        response = await api(`users/${jwtDecoded.userId}`).json();
        expect(response.success).toBeTruthy();
        expect(response.data).toBeDefined();
        profile = response.data;
        expect(profile.bio.sex).toBeUndefined();
        expect(profile.bio.born).toBe(1975);
        expect(profile.bio.region).toBe("MS");
        expect(profile.bio.edu).toBeUndefined();
        expect(profile.driving.since).toBeUndefined();
        expect(profile.driving.vehicles).toStrictEqual(["car", "bike"]);
    });

    beforeEach(async () => {
        const dbClient = await mongo.connectToDatabase();
        await dbClient.db().collection("users").deleteMany({});
    });
});

function getAuthHeader(jwt) {
    const headers = { };
    if (jwt) {
        headers.Authorization = `bearer ${jwt}`;
    }
    return headers;
}

beforeAll(() => {
    app.listen(3000, '0.0.0.0')
        .then(r => logger.info("Server started"));
});

afterAll(() => {
    if (app.close())
        logger.info("Server stopped");
});
