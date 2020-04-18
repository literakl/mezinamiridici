const dotenv = require("dotenv");
dotenv.config({ path: "C:\\dev\\mezinamiridici\\infrastructure\\.test.env" });
const mongo = require("../src/utils/mongo.js");
const logger = require("../src/utils/logging");
const app = require("../src/server.js");
const { api, bff, getAuthHeader, deepCopy } = require("./testUtils");
const { leos, jiri, lukas, vita, jana, bara } = require("./prepareUsers");
let jwtVita, jwtLeos, jwtJiri, jwtLukas, jwtJana, jwtBara;
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

    // create poll, insufficient privilleges
    body = {
        text: "First question",
    };
    response = await api("polls", {method: "POST", json: body, headers: getAuthHeader(jwtVita) });
    expect(response.success).toBeFalsy();
    expect(response.statusCode).toBe(403);

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

    // get poll, anonymous user
    let getResponse = await bff(`polls/${response.data.info.slug}`).json();
    let copy = deepCopy(response);
    delete copy.data.my_vote;
    expect(getResponse).toStrictEqual(copy);

    // get poll, other user that has not voted
    getResponse = await bff(`polls/${response.data.info.slug}`, { headers: getAuthHeader(jwtJiri) }).json();
    expect(getResponse).toStrictEqual(copy);

    // get poll, user that has voted
    getResponse = await bff(`polls/${response.data.info.slug}`, { headers: getAuthHeader(jwtLeos) }).json();
    expect(getResponse).toStrictEqual(response);

});

beforeEach(async () => {
    await dbClient.db().collection("items").deleteMany({});
    await dbClient.db().collection("polls").deleteMany({});
    await dbClient.db().collection("poll_votes").deleteMany({});
});

beforeAll(async () => {
    app.listen(3000, '0.0.0.0')
        .then(r => logger.info("Server started"));

    dbClient = await mongo.connectToDatabase();
    await dbClient.db().collection("users").deleteMany({});
    await dbClient.db().collection("users").insertMany([leos, jiri, lukas, vita, jana, bara]);

    let body = {
        email: "vita@email.bud",
        password: "BadPassword",
    };
    let response = await api("authorizeUser", { method: 'POST', json: body }).json();
    jwtVita = response.data;

    body.email = "leos@email.bud";
    response = await api("authorizeUser", { method: 'POST', json: body }).json();
    jwtLeos = response.data;

    body.email = "jiri@email.bud";
    response = await api("authorizeUser", { method: 'POST', json: body }).json();
    jwtJiri = response.data;

    body.email = "lukas@email.bud";
    response = await api("authorizeUser", { method: 'POST', json: body }).json();
    jwtLukas = response.data;

    body.email = "jana@email.bud";
    response = await api("authorizeUser", { method: 'POST', json: body }).json();
    jwtJana = response.data;

    body.email = "bara@email.bud";
    response = await api("authorizeUser", { method: 'POST', json: body }).json();
    jwtBara = response.data;
});

afterAll(() => {
    if (app.close())
        logger.info("Server stopped");
});
