const dayjs = require('dayjs');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/items/:itemId/comments', auth.cors);

  app.post('/v1/items/:itemId/comments', auth.required, auth.cors, async (req, res) => {
    logger.verbose('createComment handler starts');
    const { commentText, parentId, date } = req.body;
    const { itemId } = req.params;
    if (!itemId || !commentText) {
      return api.sendBadRequest(res, api.createError('Missing parameter', 'generic.internal-error'));
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const item = await dbClient.db().collection('items').findOne({ _id: itemId }, { projection: { _id: 1 } });
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
      const comment = createComment(itemId, commentText, req.identity, parentId, publishDate);
      await dbClient.db().collection('comments').insertOne(comment);
      logger.debug('Item inserted');

      return api.sendCreated(res, api.createResponse(comment));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create poll', 'sign-in.something-went-wrong'));
    }
  });
};

function createComment(itemId, commentText, user, parentId, date) {
  const comment = {
    _id: mongo.generateTimeId(),
    itemId,
    parentId: parentId || undefined,
    date,
    text: commentText,
    up: 0,
    down: 0,
    user: {
      userId: user.userId,
      nickname: user.nickname,
    },
  };

  if (comment.parentId === undefined) {
    delete comment.parentId;
  }

  return comment;
}
