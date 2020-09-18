const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/polls/:pollId', auth.cors);

  app.delete('/v1/polls/:pollId', auth.required, auth.poll_admin, auth.cors, async (req, res) => {
    logger.verbose('delete Poll handler starts');
    const { pollId } = req.params;

    if (!pollId) {
      return api.sendMissingParam(res, 'pollId');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const commandResult = await dbClient.db().collection('items').deleteOne({ _id: pollId });
      if (commandResult.result.ok === 1 && commandResult.result.n === 1) {
        logger.debug('Item deleted');
        return api.sendResponse(res, api.createResponse());
      } else {
        logger.error(`Item ${pollId} not deleted`);
        return api.sendInternalError(res, api.createError('Failed to delete poll', 'sign-in.something-went-wrong'));
      }
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to delete poll', 'sign-in.something-went-wrong'));
    }
  });
};
