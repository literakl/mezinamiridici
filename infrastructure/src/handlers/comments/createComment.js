const dayjs = require('dayjs');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/polls/:pollId/comment', auth.cors);

  app.post('/v1/polls/:pollId/comment', auth.required, auth.cors, async (req, res) => {
    logger.verbose('createComment handler starts');
    const { commentText, parentId, date } = req.body;
    const { pollId } = req.params;
    if (!pollId || !commentText) {
      return api.sendBadRequest(res, api.createError('Missing parameter', 'generic.internal-error'));
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const item = await dbClient.db().collection('items').findOne({ _id: pollId }, { projection: { _id: 1 } });
      if (!item) {
        return api.sendNotFound(res, api.createError('Poll not found', 'generic.internal-error'));
      }
      logger.debug('Item fetched');

      let publishDate = new Date();
      if (date) {
        const dday = dayjs(date, 'YYYY-MM-DD HH:mm:ss');
        if (!dday.isValid()) {
          return api.sendBadRequest(res, api.createError(`Date ${date} is invalid`, 'generic.internal-error'));
        }
        publishDate = dday.toDate();
      }
      const commentId = mongo.generateId();
      await insertComment(dbClient, pollId, commentId, commentText, req.identity, parentId, publishDate);
      logger.debug('Item inserted');

      const comment = await dbClient.db().collection('comments').findOne({ _id: commentId });

      return api.sendCreated(res, api.createResponse(comment));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create poll', 'sign-in.something-went-wrong'));
    }
  });
};

function insertComment(dbClient, pollId, commentId, commentText, user, parentId, date) {
  const comment = {
    _id: commentId,
    pollId,
    created: date,
    text: commentText,
    upvotes: 0,
    downvotes: 0,
    author: {
      id: user.userId,
      nickname: user.nickname,
    },
  };
  if (parentId) comment.parentId = parentId;

  return dbClient.db().collection('comments').insertOne(comment);
}
