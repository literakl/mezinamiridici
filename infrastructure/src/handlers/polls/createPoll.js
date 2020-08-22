const slugify = require('slugify');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/polls', auth.cors);

  app.post('/v1/polls', auth.required, auth.poll_admin, auth.cors, async (req, res) => {
    logger.verbose('createPoll handler starts');

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const {
        text, author, date, picture, tags,
      } = req.body;

      if (!text) {
        return api.sendBadRequest(res, api.createError('Missing parameter text', 'generic.internal-error'));
      }

      if (!picture) {
        return api.sendBadRequest(res, api.createError('Missing parameter picture', 'generic.internal-error'));
      }

      let user = auth.getIdentity(req.identity);
      if (author !== undefined && author.length > 0) {
        user = await mongo.getIdentity(dbClient, author);
        if (user === null) {
          return api.sendBadRequest(res, api.createError(`Author ${author} not found`, 'generic.internal-error'));
        }
      }

      let publishDate = new Date();
      if (date) {
        const dday = dayjs(date, 'YYYY-MM-DD');
        if (!dday.isValid()) {
          return api.sendBadRequest(res, api.createError(`Date ${date} is invalid`, 'generic.internal-error'));
        }
        publishDate = dday.toDate();
      }

      const pollId = mongo.generateTimeId();
      await insertItem(dbClient, pollId, text, user, picture, publishDate, tags);
      logger.debug('Item inserted');

      const pipeline = [mongo.stageId(pollId)];
      const item = await mongo.getPoll(dbClient, pipeline);
      logger.debug('Poll fetched');

      return api.sendCreated(res, api.createResponse(item));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create poll', 'sign-in.something-went-wrong'));
    }
  });
};

function insertItem(dbClient, pollId, text, author, picture, publishDate, tags) {
  const slug = slugify(text, { lower: true, strict: true });
  const item = {
    _id: pollId,
    type: 'poll',
    votes_count: 0,
    info: {
      author: {
        nickname: author.nickname,
        id: author.userId,
      },
      caption: text,
      slug,
      published: false,
      date: publishDate,
      picture,
      tags,
    },
    data: {
      votes: {
        neutral: 0,
        trivial: 0,
        dislike: 0,
        hate: 0,
      },
    },
    comments: {
      count: 0,
      last: null,
    },
  };

  return dbClient.db().collection('items').insertOne(item);
}
