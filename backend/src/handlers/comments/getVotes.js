const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/bff/comments/:commentId/votes', auth.cors);

  app.get('/bff/comments/:commentId/votes', auth.cors, async (req, res) => {
    logger.verbose('getVotes handler starts');
    const { commentId } = req.params;
    if (!commentId) {
      return api.sendMissingParam(res, 'commentId');
    }
    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const votes = await dbClient.db().collection('comment_votes').find({ commentId }, { projection: { _id: 0, commentId: 0 } }).toArray();
      logger.debug('Comments fetched');
      return api.sendResponse(res, api.createResponse(votes));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get comment votes', 'sign-in.something-went-wrong'));
    }
  });
};
