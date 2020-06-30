const dayjs = require('dayjs');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/items/:itemId/comments', auth.cors);

  app.post('/v1/items/:itemId/comments', auth.required, auth.cors, async (req, res) => {
    logger.verbose('createComment handler starts');
    const {
      text, parentId, date, lastReplyId,
    } = req.body;
    const { itemId } = req.params;
    if (!itemId || !text) {
      return api.sendBadRequest(res, api.createError('Missing parameter', 'generic.internal-error'));
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      let publishDate = new Date();
      if (date) {
        const dday = dayjs(date, 'YYYY-MM-DD HH:mm:ss');
        if (!dday.isValid()) {
          return api.sendBadRequest(res, api.createError(`Date ${date} is invalid`, 'generic.internal-error'));
        }
        publishDate = dday.toDate();
      }

      const response = await dbClient.db()
        .collection('items')
        .updateOne({ _id: itemId }, { $set: { 'comments.last': publishDate }, $inc: { 'comments.count': 1 } });
      if (response.modifiedCount !== 1) {
        return api.sendNotFound(res, api.createError('Item not found', 'generic.internal-error'));
      }

      const comment = createComment(itemId, text, req.identity, parentId, publishDate);
      await dbClient.db()
        .collection('comments')
        .insertOne(comment);
      logger.debug('Comment inserted');

      let replies;
      if (parentId) {
        const query = { parentId };
        if (lastReplyId) {
          query._id = { $gt: lastReplyId };
        }

        replies = await dbClient.db().collection('comments')
          .find(query, { projection: { itemId: 0 } })
          .sort({ _id: 1 })
          .toArray();
        logger.debug('Replies fetched');
      }

      const body = { comment };
      if (replies) {
        body.replies = replies;
      }
      return api.sendCreated(res, api.createResponse(body));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create poll', 'sign-in.something-went-wrong'));
    }
  });
};

function createComment(itemId, text, user, parentId, date) {
  const comment = {
    _id: mongo.generateTimeId(),
    itemId,
    parentId: parentId || undefined,
    date,
    text,
    up: 0,
    down: 0,
    user: {
      id: user.userId,
      nickname: user.nickname,
    },
  };

  if (comment.parentId === undefined) {
    delete comment.parentId;
  }

  return comment;
}
