const dayjs = require('dayjs');
const MarkdownIt = require('markdown-it');
const emoji = require('markdown-it-emoji/light');
const mark = require('markdown-it-mark');
const sanitizeHtml = require('sanitize-html');
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
  typographer: true,
  quotes: '“”‘’',
});
md.use(emoji);
md.use(mark);

module.exports = (app) => {
  app.options('/v1/items/:itemId/comments', auth.cors);

  app.post('/v1/items/:itemId/comments', auth.required, auth.cors, async (req, res) => {
    logger.verbose('createComment handler starts');
    const {
      text, parentId, date,
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

      if (parentId) {
        const response = await dbClient.db().collection('comments').findOne({ _id: parentId, parentId: null });
        if (!response) {
          return api.sendBadRequest(res, api.createError(`Comment ${parentId} is already reply`, 'generic.internal-error'));
        }
      }

      const comment = createComment(itemId, text, req.identity, parentId, publishDate);
      await dbClient.db()
        .collection('comments')
        .insertOne(comment);
      comment.votes = [];
      logger.debug('Comment inserted');

      const response = await dbClient.db().collection('items')
        .updateOne({ _id: itemId }, { $set: { 'comments.last': publishDate }, $inc: { 'comments.count': 1 } });
      if (response.modifiedCount !== 1) {
        return api.sendNotFound(res, api.createError('Item not found', 'generic.internal-error'));
      }

      let replies = [];
      if (parentId) {
        const pipeline = [
          { $match: { parentId } },
          { $sort: { _id: 1 } },
          mongo.stageCommentVotes(),
          mongo.stageHideIdsinComment(),
        ];
        replies = await dbClient.db().collection('comments').aggregate(pipeline, { allowDiskUse: true }).toArray();
        logger.debug('Replies fetched');
      }

      const body = { comment, replies };
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
    text: md.render(sanitizeHtml(text)),
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
