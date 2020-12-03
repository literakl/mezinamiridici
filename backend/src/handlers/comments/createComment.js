const sanitizeHtml = require('sanitize-html');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/items/:itemId/comments', auth.cors);

  app.post('/v1/items/:itemId/comments', auth.required, auth.cors, async (req, res) => {
    logger.verbose('createComment handler starts');
    const {
      source, parentId, date,
    } = req.body;
    const { itemId } = req.params;
    if (!itemId) {
      return api.sendMissingParam(res, 'itemId');
    }
    if (!source) {
      return api.sendMissingParam(res, 'source');
    }
    const publishDate = api.parseDate(date, 'YYYY-MM-DD HH:mm:ss');
    if (!publishDate) {
      return api.sendInvalidParam(res, 'date', date);
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      if (parentId) {
        const response = await dbClient.db().collection('comments').findOne({ _id: parentId, parentId: null });
        if (!response) {
          return api.sendBadRequest(res, api.createError(`Comment ${parentId} is already reply`, 'generic.internal-error'));
        }
      }

      const comment = createComment(itemId, source, req.identity, parentId, publishDate);
      await dbClient.db().collection('comments').insertOne(comment);
      await mongo.incrementUserActivityCounter(dbClient, req.identity.userId, 'comment', 'create');
      logger.debug('Comment inserted');

      const update = { $set: { 'comments.last': publishDate }, $inc: { 'comments.count': 1 } };
      const response = await dbClient.db().collection('items').updateOne({ _id: itemId }, update);
      if (response.modifiedCount !== 1) {
        return api.sendNotFound(res, api.createError(`Item ${itemId} not found`, 'generic.internal-error'));
      }

      let replies = [];
      if (parentId) {
        const pipeline = [
          { $match: { parentId } },
          { $sort: { _id: 1 } },
          mongo.stageCommentVotes(),
          mongo.stageReduceCommentData(),
        ];
        replies = await dbClient.db().collection('comments').aggregate(pipeline, { allowDiskUse: true }).toArray();
        logger.debug('Replies fetched');
      }

      comment.votes = [];
      const body = { comment, replies };
      return api.sendCreated(res, api.createResponse(body));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create poll', 'sign-in.something-went-wrong'));
    }
  });
};

function createComment(itemId, source, user, parentId, date) {
  const text = sanitizeHtml(source, api.sanitizeConfigure());
  const comment = {
    _id: mongo.generateTimeId(),
    itemId,
    parentId: parentId || undefined,
    date,
    text,
    up: 0,
    down: 0,
    author: {
      id: user.userId,
      nickname: user.nickname,
    },
  };

  if (comment.parentId === undefined) {
    delete comment.parentId;
  }

  return comment;
}
