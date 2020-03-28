const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');

module.exports = (app) => {
    app.get('/v1/polls/', async (req, res) => {
        console.log("getPolls handler starts");

        try {
            const dbClient = await mongo.connectToDatabase();
            console.log("Mongo connected");

            const list = await getItems(dbClient, req).toArray();
            console.log("Items fetched");
            return api.sendRresponse(res, api.createResponse(list));
        } catch (err) {
            console.log("Request failed", err);
            return api.sendInternalError(res, api.createError('Failed to get poll', "sign-in.something-went-wrong"));
        }
    })
};

function getItems(dbClient, req) {
    const listParams = api.parseListParams(req, 'published', -1, 10, 50);
    const query = {"type": "poll", "info.published": true};
    if (listParams.lastResult) {
        query[listParams.lastResult.key] = listParams.lastResult.value;
    }
    return dbClient.db().collection("items").find(query).sort(listParams.order).limit(listParams.pageSize);
}