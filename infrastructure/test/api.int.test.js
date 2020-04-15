const got = require("got");
const api = got.extend({
    prefixUrl: "http://localhost:3000/v1/",
    throwHttpErrors: false,
    headers: {
        "content-type": "application/json; charset=utf-8'"
    },
});
const bff = got.extend({
    prefixUrl: "http://localhost:3000/bff/",
    throwHttpErrors: false,
    headers: {
        "content-type": "application/json; charset=utf-8'"
    },
});
const dotenv = require("dotenv");
dotenv.config({ path: "C:\\dev\\mezinamiridici\\infrastructure\\.test.env" });
const jwt = require("jsonwebtoken");
const mongo = require("../src/utils/mongo.js");
const logger = require("../src/utils/logging");
const auth = require('../src/utils/authenticate');
const app = require("../src/server.js");
let dbClient;

describe("user accounts", () => {
    test("User API", async () => {
        jest.setTimeout(20000);

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
        let userId = jwtDecoded.userId;
        expect(jwtDecoded.nickname).toBe("leos");

        // create duplicate user
        response = await api("users", { method: "POST", json: body });
        expect(response.statusCode).toBe(409);

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
        response = await api(`users/${userId}`, { method: 'PATCH', json: body, headers: getAuthHeader(jwtData) }).json();
        expect(response.success).toBeTruthy();

        // get the user profile as anonymous user
        response = await api(`users/${userId}`).json();
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
        response = await api(`users/${userId}`, { headers: getAuthHeader(jwtData) }).json();
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
        response = await api(`users/${userId}`, { method: 'PATCH', json: body, headers: getAuthHeader(jwtData) }).json();
        expect(response.success).toBeTruthy();

        // get the user profile as anonymous user
        response = await api(`users/${userId}`).json();
        expect(response.success).toBeTruthy();
        expect(response.data).toBeDefined();
        profile = response.data;
        expect(profile.bio.sex).toBeUndefined();
        expect(profile.bio.born).toBe(1975);
        expect(profile.bio.region).toBe("MS");
        expect(profile.bio.edu).toBeUndefined();
        expect(profile.driving.since).toBeUndefined();
        expect(profile.driving.vehicles).toStrictEqual(["car", "bike"]);

        // verify account
        profile = await mongo.findUser(dbClient, {userId: userId});
        response = await api(`verify/${profile.auth.verifyToken}`, { method: 'POST' }).json();
        expect(response.success).toBeTruthy();

        // token is not valid anymore
        response = await api(`verify/${profile.auth.verifyToken}`, {method: 'POST'});
        expect(response.statusCode).toBe(403);

        // reset password
        body = {
            email: "leos@email.bud",
        };
        response = await api(`forgotPassword`, { method: 'POST', json: body }).json();
        expect(response.success).toBeTruthy();
        profile = await mongo.findUser(dbClient, {userId: userId});
        body = {
            resetPasswordToken: profile.auth.reset.token,
            password: "BadPassword",
        }
        response = await api(`resetPassword`, { method: 'POST', json: body }).json();
        expect(response.success).toBeTruthy();

        // sign in
        body = {
            email: "leos@email.bud",
            password: "BadPassword",
        };
        response = await api(`authorizeUser`, { method: 'POST', json: body }).json();
        expect(response.success).toBeTruthy();
        expect(response.data).toBeDefined();
        jwtData = response.data;
        expect(jwt.decode(jwtData).nickname).toBe("leos");

        // change password, wrong current password
        body = {
            currentPassword: "WrongPassword",
            newPassword: "UglyPassword",
        };
        response = await api(`users/${userId}/password`, { method: 'PATCH', json: body, headers: getAuthHeader(jwtData) });
        expect(response.statusCode).toBe(403);

        // change password
        body.currentPassword = "BadPassword";
        response = await api(`users/${userId}/password`, { method: 'PATCH', json: body, headers: getAuthHeader(jwtData) }).json();
        expect(response.success).toBeTruthy();
        expect(response.data).toBeDefined();

        // sign in with old password
        body = {
            email: "leos@email.bud",
            password: "BadPassword",
        };
        response = await api(`authorizeUser`, { method: 'POST', json: body });
        expect(response.statusCode).toBe(403);

        // sign in with wrong user
        body.email = "leos@email.bus";
        response = await api(`authorizeUser`, { method: 'POST', json: body });
        expect(response.statusCode).toBe(403);

        // sign in with new password
        body.email = "leos@email.bud";
        body.password = "UglyPassword";
        response = await api(`authorizeUser`, { method: 'POST', json: body }).json();
        expect(response.success).toBeTruthy();
        expect(response.data).toBeDefined();
        jwtData = response.data;

        // validate obsolete token
        const token = auth.createToken(userId, "leos", new Date(2019), null, '1m');
        response = await api(`users/${userId}/validateToken`, { method: 'POST', json: {}, headers: getAuthHeader(token) });
        expect(response.statusCode).toBe(403);

        // validate token
        response = await api(`users/${userId}/validateToken`, { method: 'POST', json: {}, headers: getAuthHeader(jwtData) }).json();
        expect(response.success).toBeTruthy();
        expect(response.data).toBeDefined();
    });

    beforeEach(async () => {
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

beforeAll(async () => {
    dbClient = await mongo.connectToDatabase();
    app.listen(3000, '0.0.0.0')
        .then(r => logger.info("Server started"));
});

afterAll(() => {
    if (app.close())
        logger.info("Server stopped");
});
