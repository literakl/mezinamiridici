const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/polls/:pollId', auth.cors);

  app.delete('/v1/polls/:pollId', auth.required, auth.poll_admin, auth.cors, async (req, res) => {
    logger.debug('delete Poll handler starts');
    const { pollId } = req.params;

    if (!pollId) {
      return api.sendMissingParam(res, 'pollId');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      const [result] = await Promise.all([
        dbClient.db().collection('items').deleteOne({ _id: pollId }),
        dbClient.db().collection('comments').deleteOne({ itemId: pollId }),
        dbClient.db().collection('comment_votes').deleteOne({ itemId: pollId }),
        mongo.logAdminActions(dbClient, req.identity.userId, 'delete poll', pollId),
      ]);
      if (result.deletedCount !== 1) {
        logger.error(`Failed to delete poll ${pollId}`);
        return api.sendInternalError(res, api.createError('Failed to delete poll', 'sign-in.something-went-wrong'));
      } else {
        logger.debug('Item deleted');
        return api.sendResponse(res, api.createResponse());
      }
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to delete poll', 'sign-in.something-went-wrong'));
    }
  });
};
