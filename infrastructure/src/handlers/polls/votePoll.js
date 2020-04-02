const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');

module.exports = (app) => {
    app.options('/bff/polls/:pollId/vote', auth.cors, () => {
    });

    app.post('/bff/polls/:pollId/vote', auth.required, auth.cors, async (req, res) => {
        console.log("votePoll handler starts");
        const { pollId } = req.params;
        const { vote } = req.query;
        if (! pollId) {
            return api.sendBadRequest(res, api.createError("Missing pollId", "generic.internal-error"));
        }
        if (! vote) {
            return api.sendBadRequest(res, api.createError("Missing vote", "generic.internal-error"));
        }

        try {
            const dbClient = await mongo.connectToDatabase();
            console.log("Mongo connected");

            let item = await dbClient.db().collection("items").findOne({_id: pollId}, {projection: {_id: 1}});
            if (!item) {
                return api.sendNotFound(res, api.createError("Poll not found", "generic.internal-error"));
            }

            const user = await mongo.findUser(dbClient, {userId: req.identity.userId}, {projection: {bio: 1, driving: 1}});
            if (!user) {
                return api.sendNotFound(res, api.createError("User not found", "generic.internal-error"));
            }

            // todo transaction
            insertPollVote(dbClient, pollId, vote, user);
            incrementPoll(dbClient, pollId, vote);
            const pipeline = [mongo.stageId(pollId), mongo.stageLookupPoll];
            item = await mongo.getPoll(dbClient, pipeline);

            return api.sendCreated(res, api.createResponse(item));
        } catch (err) {
            console.log("Request failed", err);
            return api.sendInternalError(res, api.createError('Failed to vote in polls', "sign-in.something-went-wrong"));
        }
    });
};

function insertPollVote(dbClient, pollId, vote, user) {
    const pollVote = { _id: `${pollId}_${user._id}`, "date": new Date(), vote: vote };
    const currentYear = new Date().getFullYear();
    if (user.bio.sex) {
        pollVote.sex = user.bio.sex;
    }
    if (user.bio.region) {
        pollVote.region = user.bio.region;
    }
    if (user.bio.edu) {
        pollVote.edu = user.bio.edu;
    }
    if (user.bio.born) {
        pollVote.age = currentYear - user.bio.born;
    }
    if (user.driving.vehicles) {
        pollVote.vehicles = user.driving.vehicles;
    }
    if (user.driving.since) {
        pollVote.driving = currentYear - user.driving.since;
    }
    return dbClient.db().collection("poll_votes").insertOne(pollVote);
}

function incrementPoll(dbClient, pollId, vote) {
    const inc = { $inc: {} };
    inc.$inc[`votes.${vote}`] = 1;
    return dbClient.db().collection("polls").updateOne({ _id: pollId }, inc);
}
