const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { log } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/bff/polls/last', auth.cors);
  app.options('/bff/polls/:slug', auth.cors);
  app.options('/bff/polls/id/:id', auth.cors);

  app.get('/bff/polls/last', auth.optional, async (req, res) => {
    log.info('getLastPoll handler starts');
    try {
      const dbClient = await mongo.connectToDatabase();
      const pipeline = [mongo.stagePublishedPoll(new Date()), mongo.stageSortByDateDesc, mongo.stageLimit(1)];
      if (req.identity) {
        pipeline.push(mongo.stageMyPollVote(req.identity.userId));
      }
      log.info(JSON.stringify(pipeline));
      const item = await mongo.getPoll(dbClient, pipeline);
      log.info('Item fetched');

      return api.sendResponse(res, api.createResponse(item));
    } catch (err) {
      log.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get polls', 'sign-in.something-went-wrong'));
    }
  });

  app.get('/bff/polls/:slug', auth.optional, async (req, res) => {
    log.debug('getPoll by slug handler starts');
    const { slug } = req.params;

    try {
      const dbClient = await mongo.connectToDatabase();
      const pipeline = [mongo.stageSlug(slug)];
      if (req.identity) {
        // noinspection JSCheckFunctionSignatures
        pipeline.push(mongo.stageMyPollVote(req.identity.userId));
      }
      const item = await mongo.getPoll(dbClient, pipeline);
      log.debug('Item fetched');

      if (!item) {
        return api.sendNotFound(res, api.createError('Poll not found'));
      }

      const older = mongo.getNeighbourhItem(dbClient, 'poll', item.info.date, true).next();
      const newer = mongo.getNeighbourhItem(dbClient, 'poll', item.info.date, false).next();
      await Promise.all([newer, older]).then((values) => {
        log.debug('Neighbours fetched');
        item.siblings = { newer: values[0], older: values[1] };
      });
      return api.sendResponse(res, api.createResponse(item));
    } catch (err) {
      log.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get polls', 'sign-in.something-went-wrong'));
    }
  });
};
