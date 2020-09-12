const cron = require('node-cron');
const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');

const mongo = require('../utils/mongo.js');
const logger = require('../utils/logging');
const auth = require('../utils/authenticate');
const mailService = require('../utils/mailService');

dayjs.extend(isoWeek);

const sendNewsletter = async () => {
  logger.info('Running a job to send newsletter email.');

  const dbClient = await mongo.connectToDatabase();
  const todayItems = await getTodayItems(dbClient);
  const subscribedUsers = await getSubscribedUsers(dbClient);
  const allCommentsToday = await getAllCommentsToday(dbClient);

  if (subscribedUsers.length > 0 && todayItems.length > 0) {
    for (let i = 0; i < subscribedUsers.length; i += 1) {
      let user = subscribedUsers[i];
      if (user.prefs.email.poll) {
        for (j = 0; j < todayItems.length; j += 1) {
          await sendNewPollNotification(dbClient, user, todayItems[j]);
        }
      }
    }
  }
  
  if (subscribedUsers.length > 0 && allCommentsToday.length > 0) {
    for (let i = 0; i < subscribedUsers.length; i += 1) {
      let user = subscribedUsers[i];
      if (user.prefs.email.reaction) {
        const commentsSending = await getSendEmailComment(dbClient, allCommentsToday, user);
        await sendReactionNotification(dbClient, user, commentsSending);
      }
    }
  }
  
};

const getTodayItems = async (dbClient) => {
  const today = dayjs().format('YYYY-MM-DD');
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
  const query = { 'info.date':{ $gte:new Date(today), $lt:new Date(tomorrow) }, type: 'poll' };

  return dbClient.db().collection('items')
    .find(query)
    .project({ 'info.caption': 1, 'info.slug': 1 })
    .toArray();
}

const getSubscribedUsers = async (dbClient) => {
  const query = { 'prefs.email.newsletter': true };
  return dbClient.db().collection('users')
    .find(query)
    .toArray();
};

const sendNewPollNotification = async (dbClient, user, item) => {
  const userId = user._id;
  const token = auth.createToken(userId, user.bio.nickname, new Date(), null, false, '3m');
  const options = {
    to: user.auth.email,
  };
  const context = {
    pollCaption: item.info.caption,
    pollLink: `${process.env.WEB_URL}/ankety/${item.info.slug}`,
    rejectLink: `${process.env.WEB_URL}/reject-poll-notification/${token}`,
  };
  
  await dbClient.db().collection('users').updateOne({ _id: userId }, { $set: { 'prefs.newPollRejectToken': token } });
  logger.verbose('sent new poll notification mail');
  return mailService.sendEmail('new_poll_notification.json', options, context);
};

const getSendEmailComment = async (dbClient, todayComments, user) => {
  const itemIdsUserParticipated = getItemIdsUserParticipated(dbClient, user);
  const itemIdsUserParticipatedToday = [];
  const resultComments = [];
  for (let i = 0; i < todayComments.length; i += 1) {
    const comment = todayComments[i];
    if (comment.user.id !== user._id) {
      itemIdsUserParticipatedToday.push(comment.itemId);
    }
    if (comment.user.id !== user._id && itemIdsUserParticipated.indexOf(comment.itemId) > -1 && itemIdsUserParticipatedToday.indexOf(comment.itemId) === -1) {
      resultComments.push(comment);
    }
  }
  return resultComments;
}

const getItemIdsUserParticipated = async (dbClient, user) => {
  return await dbClient.db().collection('comments')
    .find({'user.id': user._id})
    .project({ 'itemId': 1 })
    .toArray();
}

const getAllCommentsToday = async (dbClient) => {
  const today = dayjs().format('YYYY-MM-DD');
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
  const query = { date:{ $gte:new Date(today), $lt:new Date(tomorrow) } };
  return await dbClient.db().collection('comments')
    .find(query)
    .sort({ date : -1 })
    .toArray();
}

const sendReactionNotification = async (dbClient, user, comments) => {
  const userId = user._id;
  const token = auth.createToken(userId, user.bio.nickname, new Date(), null, false, '3m');
  const commentList = '';

  for (let i = 0; i < comments.length; i += 1) {
    const comment = comments[i];
    const poll = await getPollById(dbClient, comment.itemId);
    commentList += `<a href="${process.env.WEB_URL}/ankety/${poll.info.slug}">${poll.info.caption}</a>, komentářů: ${poll.comments.count}, poslední ${dayjs(poll.comments.last).format('HH:mm')}`
  }
  
  const options = {
    to: user.auth.email,
  };
  const context = {
    rejectLink: `${process.env.WEB_URL}/reject-reaction-notification/${token}`,
    commentList,
  };
  
  await dbClient.db().collection('users').updateOne({ _id: userId }, { $set: { 'prefs.reactionRejectToken': token } });
  
  logger.verbose('sent reaction notification mail');
  return mailService.sendEmail('reaction_notification.json', options, context);
}

const getPollById = async (dbClient, id) => {
  return await dbClient.db().collection('items')
    .findOne({_id: id});
}

module.exports = async () => {
  logger.debug('Notification email scheduler starts');
  cron.schedule(process.env.NOTIFICATION_EMAIL_SCHEDULE, async () => sendNewsletter(), {
    scheduled: true,
    timezone: 'Europe/Prague',
  });
};