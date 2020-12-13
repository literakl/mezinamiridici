const slugify = require('slugify');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

let { NODE_ENV } = process.env;
if (!NODE_ENV) {
  NODE_ENV = 'production';
}

module.exports = (app) => {
  app.options('/v1/polls/:pollId', auth.cors);

  app.patch('/v1/polls/:pollId', auth.required, auth.poll_admin, auth.cors, async (req, res) => {
    logger.verbose('updatePoll handler starts');
    const { pollId } = req.params;
    if (!pollId) {
      return api.sendMissingParam(res, 'pollId');
    }
    const {
      text, author, date, picture, published, tags,
    } = req.body;

    const publishDate = api.parseDate(date, 'YYYY-MM-DD');
    if (!publishDate) {
      return api.sendInvalidParam(res, 'date', date);
    }

    if (!text) {
      return api.sendMissingParam(res, 'text');
    }

    if (!picture) {
      return api.sendMissingParam(res, 'picture');
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      let user = auth.getIdentity(req.identity);
      if (author !== undefined && author.length > 0 && ['development', 'test'].includes(NODE_ENV)) {
        user = await mongo.getIdentity(dbClient, author);
        if (user === null) {
          return api.sendBadRequest(res, api.createError(`Author ${author} not found`, 'generic.internal-error'));
        }
      }

      const query = prepareUpdateQuery(text, user, picture, publishDate, published, tags);
      await dbClient.db().collection('items').updateOne({ _id: pollId }, query);
      logger.debug('Item updated');

      const pipeline = [mongo.stageId(pollId), mongo.stageMyPollVote(req.identity.userId)];
      const item = await mongo.getPoll(dbClient, pipeline);
      logger.debug('Updated item fetched');
      return api.sendResponse(res, api.createResponse(item));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create poll', 'sign-in.something-went-wrong'));
    }
  });
};

function prepareUpdateQuery(text, author, picture, date, published, tags) {
  const setters = {}, unsetters = {};
  setters['info.caption'] = text;
  setters['info.slug'] = slugify(text, { lower: true, strict: true });
  setters['info.author'] = { nickname: author.nickname, id: author.userId };
  setters['info.date'] = date;
  setters['info.published'] = published;
  setters['info.picture'] = picture;
  if (tags) {
    setters['info.tags'] = tags;
  }
  const query = { };
  query.$set = setters;
  if (Object.keys(unsetters).length !== 0) {
    query.$unset = unsetters;
  }
  return query;
}
