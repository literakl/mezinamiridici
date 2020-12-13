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
  app.options('/v1/polls', auth.cors);

  app.post('/v1/polls', auth.required, auth.poll_admin, auth.cors, async (req, res) => {
    logger.verbose('createPoll handler starts');
    const {
      text, author, date, picture, tags,
    } = req.body;

    if (!text) {
      return api.sendMissingParam(res, 'text');
    }

    const publishDate = api.parseDate(date, 'YYYY-MM-DD');
    if (!publishDate) {
      return api.sendInvalidParam(res, 'date', date);
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
