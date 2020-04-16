const dotenv = require("dotenv");
dotenv.config({ path: "C:\\dev\\mezinamiridici\\infrastructure\\.test.env" });
const mongo = require("../src/utils/mongo.js");
const logger = require("../src/utils/logging");
const app = require("../src/server.js");
const { api, bff, getAuthHeader } = require("./testUtils");
const { leos, jiri, lukas, vita, jana, bara } = require("./prepareUsers");
let dbClient;

test("Poll API", async () => {
    jest.setTimeout(60000);

    // sign in ordinary user
    let body = {
        email: "vita@email.bud",
        password: "BadPassword",
    };
    let response = await api("authorizeUser", { method: 'POST', json: body }).json();
    let jwtData = response.data;

    // create poll, insufficient privilleges
    body = {
        text: "First question",
    };
    response = await api("polls", {method: "POST", json: body, headers: getAuthHeader(jwtData)});
    expect(response.success).toBeFalsy();
    expect(response.statusCode).toBe(403);

    // sign in admin user
    body = {
        email: "leos@email.bud",
        password: "BadPassword",
    };
    response = await api("authorizeUser", { method: 'POST', json: body }).json();
    jwtData = response.data;

    // create poll, admin privilleges
    body = {
        text: "First question",
    };
    response = await api("polls", {method: "POST", json: body, headers: getAuthHeader(jwtData)}).json();
    expect(response.success).toBeTruthy();
    expect(response.data).toBeDefined();
    expect(response.data.id).toBeDefined();
});

beforeEach(async () => {
    await dbClient.db().collection("items").deleteMany({});
    await dbClient.db().collection("polls").deleteMany({});
    await dbClient.db().collection("poll_votes").deleteMany({});
});

beforeAll(async () => {
    dbClient = await mongo.connectToDatabase();
    await dbClient.db().collection("users").deleteMany({});
    const re = await dbClient.db().collection("users").insertMany([leos, jiri, lukas, vita, jana, bara]);

    app.listen(3000, '0.0.0.0')
        .then(r => logger.info("Server started"));
});

afterAll(() => {
    if (app.close())
        logger.info("Server stopped");
});
