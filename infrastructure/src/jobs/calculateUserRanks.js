const cron = require('node-cron');

const mongo = require('../utils/mongo.js');
const logger = require('../utils/logging');

module.exports = async () => {
  logger.debug('Scheduler starts');
  cron.schedule(process.env.SCHEDULE_TIME, async () => calculateUserHonors(), {
    scheduled: true,
    timezone: 'Europe/Prague',
  });
};

const calculateUserHonors = async () => {
  logger.info('Running a job to calculate the user ranks');

  const dbClient = await mongo.connectToDatabase();
  let users = await getUsers(dbClient, undefined, 100);
  while (users.length > 0) {
    let user;
    for (let i = 0; i < users.length; i += 1) {
      user = users[i];
      const currentRank = (user.honors) ? user.honors.rank : '';
      const userId = user._id;
      let finalRank = 'novice';
      const pollVotesCount = user.honors.count.poll_votes, commentVotesCount = user.honors.count.comment_votes,
        commentsCount = user.honors.count.comments, blogCount = user.honors.count.blogs, sharesCount = user.honors.count.shares;

      if (!currentRank || currentRank === 'novice') {
        if (pollVotesCount >= 1 && commentVotesCount >= 1 && sharesCount >= 1 && commentsCount >= 1) {
          finalRank = 'student';
        }
      } else if (currentRank === 'student') {
        // eslint-disable-next-line no-await-in-loop
        const positiveCommentsVotesCount = await getPositiveCommentsVotesCount(dbClient, userId);
        if (pollVotesCount >= 3 && sharesCount >= 10 && positiveCommentsVotesCount >= 5 && blogCount >= 1) {
          finalRank = 'graduate';
        }
      } else if (currentRank === 'graduate') {
        const positivePercentPromise = getPositivePercent(dbClient, userId);
        const consecutiveSharingPromise = getConsecutiveSharing(dbClient, userId, 10);
        // eslint-disable-next-line no-await-in-loop
        const [positivePercent, consecutiveSharing] = await Promise.all([positivePercentPromise, consecutiveSharingPromise]);
        if (pollVotesCount >= 10 && consecutiveSharing && positivePercent >= 80 && commentsCount >= 100 && blogCount >= 10) {
          finalRank = 'master';
        }
      }

      if (currentRank !== finalRank) {
        // eslint-disable-next-line no-await-in-loop
        await dbClient.db().collection('users').updateOne({ _id: userId }, { 'honors.rank': finalRank });
      }
    }
    // eslint-disable-next-line no-await-in-loop
    users = await getUsers(dbClient, user._id, 100);
  }
};

const getUsers = async (dbClient, lastId, pageSize = 5) => {
  const query = {};
  if (lastId !== undefined) {
    query._id = { $gt: lastId };
  }
  return dbClient.db().collection('users')
    .find(query)
    .sort({ _id: 1 })
    .project({ honors: 1 })
    .limit(pageSize)
    .toArray();
};

const getPositiveCommentsVotesCount = async (dbClient, userId) => {
  const arr = [];
  await dbClient.db().collection('comments').aggregate([
    { $match: { 'user.id': userId, up: { $gt: 0 } } },
    { $group: { _id: '$itemId', count: { $sum: 1 } } },
  ]).forEach((item) => { arr.push(item); }); // TODO invalid number of arguments, expected 2

  return arr.length;
};

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
