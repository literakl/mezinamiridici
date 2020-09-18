const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/bff/polls/last', auth.cors);
  app.options('/bff/polls/:slug', auth.cors);
  app.options('/bff/polls/id/:id', auth.cors);

  app.get('/bff/polls/last', auth.optional, async (req, res) => {
    logger.verbose('getLastPoll handler starts');
    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const pipeline = [mongo.stagePublishedPoll, mongo.stageSortByDateDesc, mongo.stageLimit(1)];
      if (req.identity) {
        pipeline.push(mongo.stageMyPollVote(req.identity.userId));
      }
      const item = await mongo.getPoll(dbClient, pipeline);
      logger.debug('Item fetched');

      return api.sendCreated(res, api.createResponse(item));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get polls', 'sign-in.something-went-wrong'));
    }
  });

  app.get('/bff/polls/:slug', auth.optional, async (req, res) => {
    logger.verbose('getPoll by slug handler starts');
    const { slug } = req.params;

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const pipeline = [mongo.stageSlug(slug)];
      if (req.identity) {
        // noinspection JSCheckFunctionSignatures
        pipeline.push(mongo.stageMyPollVote(req.identity.userId));
      }
      const item = await mongo.getPoll(dbClient, pipeline);
      logger.debug('Item fetched');

      if (!item) {
        return api.sendNotFound(res, api.createError());
      }

      const older = mongo.getNeighbourhItem(dbClient, 'poll', item.info.date, true).next();
      const newer = mongo.getNeighbourhItem(dbClient, 'poll', item.info.date, false).next();
      await Promise.all([newer, older]).then((values) => {
        logger.debug('Neighbours fetched');
        item.siblings = { newer: values[0], older: values[1] };
      });
      return api.sendCreated(res, api.createResponse(item));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get polls', 'sign-in.something-went-wrong'));
    }
  });
};
