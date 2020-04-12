const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const logger = require("../../utils/logging");

module.exports = (app) => {
    app.get('/bff/polls/:pollId/votes', async (req, res) => {
        logger.verbose("getVotes handler starts");
        const { pollId } = req.params;
        if (! pollId) {
            return api.sendBadRequest(res, api.createError("Missing poll id", "generic.internal-error"));
        }

        try {
            const dbClient = await mongo.connectToDatabase();
            logger.debug("Mongo connected");

            const list = await getItems(dbClient, pollId, req).toArray();
            logger.debug("Items fetched");

            return api.sendRresponse(res, api.createResponse(list));
        } catch (err) {
            logger.error("Request failed", err);
            return api.sendInternalError(res, api.createError('Failed to get poll votes', "generic.internal-error"));
        }
    })
};

function getItems(dbClient, pollId, req) {
    const conditions = {$match: {poll: pollId}};
    const filters = api.parsePollFilterParams(req);
    handleRange(conditions, filters, "age");
    handleRange(conditions, filters, "driving");
    Object.assign(conditions.$match, filters);
    if (Array.isArray(conditions.$match.vehicles)) {
        conditions.$match.vehicles = { $in : conditions.$match.vehicles};
    }
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

function handleRange(conditions, filters, param) {
    if (!filters[param])
        return;
    const values = filters[param].split(":");
    conditions.$match[param] = { $gte: Number(values[0]), $lt: Number(values[1]) };
    delete filters[param];
}
