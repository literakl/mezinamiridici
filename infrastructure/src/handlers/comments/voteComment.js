const dayjs = require('dayjs');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/comment/:commentId/vote', auth.cors);
  app.post('/v1/comment/:commentId/vote', auth.required, auth.cors, async (req, res) => {
    logger.verbose('voteComment handler starts');
    const { pollId, vote, date } = req.body;
    const { commentId } = req.params;
    if (!pollId || !commentId || !vote || (vote !== -1 && vote !== 1)) {
      return api.sendBadRequest(res, api.createError('Missing parameter', 'generic.internal-error'));
    }

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      // let poll = await dbClient.db().collection("polls").findOne({ _id: pollId }, { projection: { _id: 1 } });
      // if (!poll) {
      //     return api.sendNotFound(res, api.createError("Poll not found", "generic.internal-error"));
      // }
      const commentVote = await dbClient.db().collection('comment_votes').findOne({ pollId, commentId, 'author.userId': req.identity.userId });
      if (commentVote && commentVote.vote !== undefined) {
        return api.sendResponse(res, api.createError('You have already voted.', 'generic.internal-error'));
      }

      const comment = await dbClient.db().collection('comments').findOne({ _id: commentId }, { projection: { _id: 1, pollId: 1, author: 1 } });
      logger.debug('Item fetched');
      if (!comment && !comment._id && !comment.pollId) {
        return api.sendNotFound(res, api.createError('Comment not found', 'generic.internal-error'));
      }
      if (comment.author !== undefined && comment.author.userId === req.identity.userId) {
        return api.sendResponse(res, api.createError('You can not vote your own comment.', 'generic.internal-error'));
      }

      let publishDate = new Date();
      if (date) {
        const dday = dayjs(date, 'YYYY-MM-DD HH:mm:ss');
        if (!dday.isValid()) {
          return api.sendBadRequest(res, api.createError(`Date ${date} is invalid`, 'generic.internal-error'));
        }
        publishDate = dday.toDate();
      }
      const commentVoteId = mongo.generateId();
      await insertCommentVote(dbClient, commentVoteId, pollId, commentId, vote, publishDate, req.identity);
      const updatedRecord = await incrementVote(dbClient, pollId, commentId, vote, comment);

      logger.debug('Item inserted');
      return api.sendCreated(res, api.createResponse(updatedRecord.value));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create comment vote', 'sign-in.something-went-wrong'));
    }
  });
};

function insertCommentVote(dbClient, commentVoteId, pollId, commentId, vote, date, user) {
  const commentVote = {
    _id: commentVoteId,
    pollId,
    commentId,
    date,
    vote,
    user: {
      nickname: user.nickname,
      id: user.userId,
    },
  };
  return dbClient.db().collection('comment_votes').insertOne(commentVote);
}

function incrementVote(dbClient, pollId, commentId, vote) {
  let update;
  if (vote === 1) {
    update = { $inc: { up: 1 } };
  } else {
    update = { $inc: { down: 1 } };
  }

  return dbClient.db().collection('comments')
    .findOneAndUpdate({ _id: commentId, pollId }, update, { returnOriginal: false });
}
