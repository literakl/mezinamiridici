const cron = require('node-cron');

const mongo = require('./mongo.js');
const logger = require('./logging');

module.exports = async () => {
  const dbClient = await mongo.connectToDatabase();
  logger.debug('Scheduler starts');

  const task = cron.schedule('*/2 * * * * *', async () => { // TODO move cron expression to environment
    logger.debug('Running a job at 00:00 at Europe/Prague timezone');

    // todo get user id and its honor object (I will need in later phase)
    const userArray = await getUsers(dbClient); // TODO iterate users by 100, this code might break for tens of thousands of users

    userArray.forEach(async (userId) => { // TODO Promise returned from forEach ignored
      const currentRank = 'novice'; // todo from user honors object
      let finalRank = '';
      if (!currentRank || currentRank === 'novice') {
        const pollVotesCount = await getPollVoteCount(dbClient, userId);
        const commentVotesCount = await getCommentVotesCount(dbClient, userId);
        const shareLinkCount = await getShareLinkCount(dbClient, userId);
        const commentedCount = await getCommentedCount(dbClient, userId);

        if (pollVotesCount >= 1 && commentVotesCount >= 1 && shareLinkCount >= 1 && commentedCount >= 1) {
          finalRank = 'student';
        }
      } else if (currentRank === 'student') {
        const pollVotesCount = await getPollVoteCount(dbClient, userId);
        const shareLinkCount = await getShareLinkCount(dbClient, userId);
        const positiveCommentsVotesCount = await getPositiveCommentsVotesCount(dbClient, userId);
        const blogCount = await getBlogCount(dbClient, userId);

        if (pollVotesCount >= 3 && shareLinkCount >= 10 && positiveCommentsVotesCount >= 5 && blogCount >= 1) {
          finalRank = 'graduate';
        }
      } else if (currentRank === 'graduate') {
        const pollVotesCount = await getPollVoteCount(dbClient, userId);
        const positivePercent = await getPositivePercent(dbClient, userId);
        const commentedCount = await getCommentedCount(dbClient, userId);
        const blogCount = await getBlogCount(dbClient, userId);
        const consecutiveSharing = await getConsecutiveSharing(dbClient, userId, 10);

        if (pollVotesCount >= 10 && consecutiveSharing && positivePercent >= 80 && commentedCount >= 100 && blogCount >= 10) {
          finalRank = 'master';
        }
      } else {
        return;
      }
      // const pollVotesCount = await getPollVoteCount(dbClient, userId);
      // const commentVotesCount = await getCommentVotesCount(dbClient, userId);
      // const shareLinkCount = await getShareLinkCount(dbClient, userId);
      // const commentedCount = await getCommentedCount(dbClient, userId);
      // const positiveCommentsVotesCount = await getPositiveCommentsVotesCount(dbClient, userId);
      // const blogCount = await getBlogCount(dbClient, userId);
      // const positivePercent = await getPositivePercent(dbClient, userId);
      // const consecutiveSharing = await getConsecutiveSharing(dbClient, userId, 10);

      if (currentRank !== finalRank) {
        await dbClient.db().collection('users').updateOne({ _id: userId }, {
          $set: { 'honors.rank': finalRank },
        });
      }
    });

    task.destroy(); // TODO for dev testing. should remove after test.
  }, {
    scheduled: true,
    timezone: 'Europe/Prague',
  });
};

// TODO return user id and honors object
// TOOD add new argument - the last _id
// TOOD fetch page size of users smaller that last_id sorted by _id descending
const getUsers = async (dbClient) => {
  const arr = [];
  await dbClient.db().collection('users')
    .find().project({ honors: 1 })
    .toArray();
  return arr;
};

const getPollVoteCount = async (dbClient, userId) => dbClient.db().collection('poll_votes').find({ user: userId }).count();

const getCommentVotesCount = async (dbClient, userId) => dbClient.db().collection('comment_votes').find({ 'user.id': userId }).count();

const getShareLinkCount = async (dbClient, userId) => dbClient.db().collection('link_share').find({ user: userId }).count();

const getCommentedCount = async (dbClient, userId) => dbClient.db().collection('comments').find({ 'user.id': userId }).count();

const getPositiveCommentsVotesCount = async (dbClient, userId) => {
  const arr = [];
  await dbClient.db().collection('comments').aggregate([
    { $match: { 'user.id': userId, up: { $gt: 1 } } },
    { $group: { _id: '$itemId', count: { $sum: 1 } } },
  ]).forEach((item) => { arr.push(item); }); // TODO invalid number of arguments, expected 2

  return arr.length;
};

const getBlogCount = async (dbClient, userId) => dbClient.db().collection('items').find({ 'info.author.id': userId }).count();

const getPositivePercent = async (dbClient, userId) => {
  let positive = 0, negative = 0;
  await dbClient.db().collection('comments').aggregate([
    { $match: { 'user.id': userId } },
    { $group: { _id: '$user.id', total_p: { $sum: '$up' }, total_n: { $sum: '$down' } } },
  ]).forEach((item) => {
    positive = item.total_p;
    negative = item.total_n;
  });
  return (positive === 0 && negative === 0) ? 0 : 100 * positive / (positive + negative);
};

const getConsecutiveSharing = async (dbClient, userId, consecutive = 5) => {
  const weekArray = [];
  const pipeline = [
    {
      $match: {
        user: userId,
      },
    },
    {
      $group: {
        _id: { $week: '$date' },
        documentCount: { $sum: 1 },
      },
    },
  ];
  await dbClient.db().collection('link_share').aggregate(pipeline).forEach((item) => {
    weekArray.push(item._id);
  });

  if (weekArray.length === 0) return false;

  const maxW = Math.max.apply(null, weekArray);
  if (maxW > 51) {
    weekArray.forEach((item, index) => {
      if ((maxW - item) > consecutive) weekArray[index] = item + maxW;
    });
  }
  weekArray.sort((a, b) => a - b);
  return consecutiveDigits(weekArray, consecutive);
};

// TODO I will have to use debugger to understand this code
const consecutiveDigits = (arr, consecutive) => {
  let curr, prev, count = 0;
  for (let i = 0; i < arr.length; i += 1) {
    curr = arr[i];
    if (count === 0) {
      count += 1;
    } else if (prev + 1 === curr) {
      count += 1;
      if (count === consecutive) {
        return true;
      }
    }
    prev = curr;
  }
  return false;
};
