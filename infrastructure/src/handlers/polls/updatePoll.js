const slugify = require('slugify');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

module.exports = (app) => {
  app.patch('/v1/polls/:pollId', auth.required, auth.poll_admin, auth.cors, async (req, res) => {
    logger.verbose('updatePoll handler starts');
    const { pollId } = req.params;
    if (!pollId) {
      return api.sendBadRequest(res, api.createError('Missing parameter pollId', 'generic.internal-error'));
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const {
        text, author, date, picture, published,
      } = req.body;

      if (!text) {
        return api.sendBadRequest(res, api.createError('Missing parameter text', 'generic.internal-error'));
      }

      if (!picture) {
        return api.sendBadRequest(res, api.createError('Missing parameter picture', 'generic.internal-error'));
      }

      let user = auth.getIdentity(req.identity);
      if (author !== undefined) {
        user = await mongo.getIdentity(dbClient, author);
        if (user === null) {
          return api.sendBadRequest(res, api.createError(`Author ${author} not found`, 'generic.internal-error'));
        }
      }

      let publishDate = new Date();
      if (date) {
        const dday = dayjs(date, 'YYYY-MM-DD');
        publishDate = new Date(1000 * dday.unix());
      }

      const query = prepareUpdateQuery(text, user, picture, publishDate, published);
      await dbClient.db().collection('items').updateOne({ _id: pollId }, query);
      logger.debug('Item updated');
      return api.sendRresponse(res, api.createResponse());
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create poll', 'sign-in.something-went-wrong'));
    }
  });
};

function prepareUpdateQuery(text, author, picture, date, published) {
  const setters = {};
  setters['info.caption'] = text;
  setters['info.slug'] = slugify(text, { lower: true, strict: true });
  setters['info.picture'] = picture;
  setters['info.author'] = author;
  setters['info.date'] = date;
  setters['info.published'] = published;
  const query = { };
  query.$set = setters;
  return query;
}
