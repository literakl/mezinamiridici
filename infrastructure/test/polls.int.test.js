const dotenv = require("dotenv");
dotenv.config({ path: "C:\\dev\\mezinamiridici\\infrastructure\\.test.env" });
const mongo = require("../src/utils/mongo.js");
const logger = require("../src/utils/logging");
const app = require("../src/server.js");
const { api, bff, getAuthHeader, deepCopy } = require("./testUtils");
const { leos, jiri, lukas, vita, jana, bara } = require("./prepareUsers");
let dbClient;

test("Poll API", async () => {
    jest.setTimeout(60000);

    // create poll, anonymous user
    let body = {
        text: "First question",
    };
    let response = await api("polls", { method: "POST", json: body });
    expect(response.success).toBeFalsy();
    expect(response.statusCode).toBe(401);

    // sign in ordinary user
    body = {
        email: "vita@email.bud",
        password: "BadPassword",
    };
    response = await api("authorizeUser", { method: 'POST', json: body }).json();
    let jwtData = response.data;

    // create poll, insufficient privilleges
    body = {
        text: "First question",
    };
    response = await api("polls", {method: "POST", json: body, headers: getAuthHeader(jwtData) });
    expect(response.success).toBeFalsy();
    expect(response.statusCode).toBe(403);

    // sign in admin user
    body = {
        email: "leos@email.bud",
        password: "BadPassword",
    };
    response = await api("authorizeUser", { method: 'POST', json: body }).json();
    const jwtLeos = response.data;

    // create poll, admin privilleges
    const firstPoll = {
        text: "First question",
    };
    response = await api("polls", { method: "POST", json: firstPoll, headers: getAuthHeader(jwtLeos) }).json();
    expect(response.success).toBeTruthy();
    expect(response.data).toBeDefined();
    expect(response.data.id).toBeDefined();
    const firstPollId = response.data.id;

    // create second poll
    const secondPoll = {
        text: "Second question",
    };
    response = await api("polls", { method: "POST", json: secondPoll, headers: getAuthHeader(jwtLeos) }).json();
    expect(response.success).toBeTruthy();
    const secondPollId = response.data.id;

    // create third poll
    const thirdPoll = {
        text: "Third question",
    };
    response = await api("polls", { method: "POST", json: thirdPoll, headers: getAuthHeader(jwtLeos) }).json();
    expect(response.success).toBeTruthy();
    const thirdPollId = response.data.id;

    // create fourth poll
    const fourthPoll = {
        text: "Fourth question",
    };
    response = await api("polls", { method: "POST", json: fourthPoll, headers: getAuthHeader(jwtLeos) }).json();
    expect(response.success).toBeTruthy();
    const fourthPollId = response.data.id;

    // vote
    body = { vote: "neutral" };
    response = await bff(`polls/${firstPollId}/votes`, { method: "POST", json: body, headers: getAuthHeader(jwtLeos) }).json();
    expect(response.success).toBeTruthy();
    expect(response.data).toBeDefined();
    expect(response.data._id).toBe(firstPollId);
    expect(response.data.info.caption).toBe(firstPoll.text);
    expect(response.data.info.slug).toBe("first-question");
    expect(response.data.info.published).toBe(true);
    expect(response.data.my_vote).toBe("neutral");
    expect(response.data.votes_count).toBe(1);
    expect(response.data.votes.neutral).toBe(1);
    expect(response.data.votes.trivial).toBe(0);
    expect(response.data.votes.dislike).toBe(0);
    expect(response.data.votes.hate).toBe(0);

    let getResponse = await bff(`polls/${response.data.info.slug}`).json();
    let copy = deepCopy(response);
    delete copy.data.my_vote;
    expect(getResponse).toStrictEqual(copy);

    getResponse = await bff(`polls/${response.data.info.slug}`, { headers: getAuthHeader(jwtLeos) }).json();
    expect(getResponse).toStrictEqual(response);

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
