const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');

module.exports = (app) => {
    app.get('/bff/polls/:pollId/votes', async (req, res) => {
        console.log("getVotes handler starts");
        const { pollId } = req.params;
        if (! pollId) {
            return api.sendBadRequest(res, api.createError("Missing poll id", "generic.internal-error"));
        }

        try {
            const dbClient = await mongo.connectToDatabase();
            console.log("Mongo connected");

            const list = await getItems(dbClient, pollId, req).toArray();
            console.log("Items fetched");
            return api.sendRresponse(res, api.createResponse(list));
        } catch (err) {
            console.log("Request failed", err);
            return api.sendInternalError(res, api.createError('Failed to get poll votes', "generic.internal-error"));
        }
    })
};

function getItems(dbClient, pollId, req) {
    const conditions = {$match: {poll: pollId}};
    const filters = api.parsePollFilterParams(req);
    Object.assign(conditions.$match, filters);
    return dbClient.db().collection("poll_votes").aggregate([
        conditions,
        {
            $group: {
                _id: "$vote",
                count: {$sum: 1}
            }
        },
    ]);
}
