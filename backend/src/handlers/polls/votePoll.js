const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/bff/polls/:pollId/votes', auth.cors);

  app.post('/bff/polls/:pollId/votes', auth.required, auth.cors, async (req, res) => {
    logger.verbose('votePoll handler starts');
    const { pollId } = req.params;
    const { vote } = req.body;
    if (!pollId) {
      return api.sendMissingParam(res, 'pollId');
    }
    if (!vote) {
      return api.sendMissingParam(res, 'vote');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      let item = await dbClient.db().collection('items').findOne({ _id: pollId }, { projection: { _id: 1 } });
      if (!item) {
        return api.sendNotFound(res, api.createError('Poll not found', 'generic.internal-error'));
      }
      logger.debug('Item fetched');

      const user = await mongo.findUser(dbClient, { userId: req.identity.userId }, { projection: { bio: 1, driving: 1 } });
      if (!user) {
        return api.sendNotFound(res, api.createError('User not found', 'generic.internal-error'));
      }
      logger.debug('User fetched');

      // todo transaction, replicas required
      await insertPollVote(dbClient, pollId, vote, user);
      await incrementPoll(dbClient, pollId, vote);
      await mongo.incrementUserActivityCounter(dbClient, user._id, 'poll', 'vote');
      logger.debug('Vote recorded');

      const pipeline = [mongo.stageId(pollId), mongo.stageMyPollVote(user._id, pollId)];
      item = await mongo.getPoll(dbClient, pipeline);
      logger.debug('Updated poll fetched');

      return api.sendCreated(res, api.createResponse(item));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to vote in polls', 'sign-in.something-went-wrong'));
    }
  });
};

function insertPollVote(dbClient, pollId, vote, user) {
  const pollVote = {
    item: pollId, user: user._id, vote,
  };
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

  return dbClient.db().collection('poll_votes').insertOne(pollVote);
}

function incrementPoll(dbClient, pollId, vote) {
  const inc = { $inc: {} };
  inc.$inc[`data.votes.${vote}`] = 1;
  inc.$inc.votes_count = 1;
  dbClient.db().collection('items').updateOne({ _id: pollId }, inc);
}
