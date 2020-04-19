const {api} = require("./testUtils");
const app = require("../src/server.js");
const logger = require("../src/utils/logging");

test("Status API", async () => {
    expect(api("status").json()).toBeDefined();
});

beforeAll(async () => {
    app.listen(3000, '0.0.0.0')
        .then(r => logger.info("Server started"));
});

afterAll(() => {
    if (app.close())
        logger.info("Server stopped");
});
