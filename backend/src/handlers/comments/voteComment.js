const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/comments/:commentId/votes', auth.cors);

  app.post('/v1/comments/:commentId/votes', auth.required, auth.cors, async (req, res) => {
    logger.verbose('voteComment handler starts');
    const { vote } = req.body;
    const { commentId } = req.params;
    if (!commentId) {
      return api.sendMissingParam(res, 'commentId');
    }
    if (!vote) {
      return api.sendMissingParam(res, 'vote');
    }
    if (vote !== -1 && vote !== 1) {
      return api.sendInvalidParam(res, 'vote', vote);
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const commentVote = await dbClient.db().collection('comment_votes').findOne({ commentId, 'user.id': req.identity.userId });
      if (commentVote && commentVote.vote !== undefined) {
        return api.sendConflict(res, api.createError('You have already voted.', 'generic.internal-error'));
      }

      const comment = await dbClient.db().collection('comments').findOne({ _id: commentId }, { projection: { _id: 1, author: 1, itemId: 1 } });
      logger.debug('Item fetched');
      if (!comment || !comment._id) {
        return api.sendNotFound(res, api.createError('Comment not found', 'generic.internal-error'));
      }
      if (comment.author !== undefined && comment.author.id === req.identity.userId) {
        return api.sendBadRequest(res, api.createError('You can not vote your own comment.', 'generic.internal-error'));
      }

      await insertCommentVote(dbClient, commentId, vote, req.identity, comment.itemId);
      await mongo.incrementUserActivityCounter(dbClient, req.identity.userId, 'comment', 'vote');
      logger.debug('Vote inserted');
      const updatedRecord = await incrementVote(dbClient, commentId, vote, comment);
      logger.debug('Item updated');
      return api.sendCreated(res, api.createResponse(updatedRecord.value));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create comment vote', 'sign-in.something-went-wrong'));
    }
  });
};

function insertCommentVote(dbClient, commentId, vote, user) {
  const commentVote = {
    _id: mongo.generateTimeId(),
    commentId,
    vote,
    user: {
      id: user.userId,
      nickname: user.nickname,
    },
  };
  return dbClient.db().collection('comment_votes').insertOne(commentVote);
}

function incrementVote(dbClient, commentId, vote) {
  let update;
  if (vote === 1) {
    update = { $inc: { up: 1 } };
  } else {
    update = { $inc: { down: 1 } };
  }

  return dbClient.db().collection('comments')
    .findOneAndUpdate({ _id: commentId }, update, { returnOriginal: false });
}
