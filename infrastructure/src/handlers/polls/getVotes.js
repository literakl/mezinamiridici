const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.get('/bff/polls/:pollId/votes', async (req, res) => {
    logger.verbose('getVotes handler starts');
    const { pollId } = req.params;

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const list = await getVotes(dbClient, pollId, req).toArray();
      logger.debug('Votes fetched');

      const votes = {
        neutral: 0, trivial: 0, dislike: 0, hate: 0,
      };
      list.forEach((x) => {
        votes[x._id] = x.count;
      });
      votes.total = votes.neutral + votes.trivial + votes.dislike + votes.hate;
      return api.sendResponse(res, api.createResponse(votes));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get poll votes', 'generic.internal-error'));
    }
  });
};

function getVotes(dbClient, pollId, req) {
  const conditions = { $match: { item: pollId } };
  const filters = api.parsePollFilterParams(req);
  handleRange(conditions, filters, 'age');
  handleRange(conditions, filters, 'driving');
  Object.assign(conditions.$match, filters);
  return dbClient.db().collection('poll_votes').aggregate([
    conditions,
    {
      $group: {
        _id: '$vote',
        count: { $sum: 1 },
      },
    },
  ]);
}

function handleRange(conditions, filters, param) {
  if (!filters[param]) return;
  const values = filters[param].split(':');
  conditions.$match[param] = { $gte: Number(values[0]), $lt: Number(values[1]) };
  delete filters[param];
}
