const cron = require('node-cron');

const mongo = require('../utils/mongo.js');
const logger = require('../utils/logging');

const calculateUserHonors = async () => {
  logger.info('Running a job to calculate the user ranks');

  const dbClient = await mongo.connectToDatabase();
  let users = await getUsers(dbClient, undefined, 100);
  while (users.length > 0) {
    let user;
    for (let i = 0; i < users.length; i += 1) {
      const setters = {};
      user = users[i];
      const currentRank = (user.honors) ? user.honors.rank : '';
      let finalRank = 'novice';
      const pollVotesCount = user.honors.count.poll_votes, commentVotesCount = user.honors.count.comment_votes,
        commentsCount = user.honors.count.comments, blogCount = user.honors.count.blogs, sharesCount = user.honors.count.shares;
      // eslint-disable-next-line no-await-in-loop
      const commentRatio = await getCommentRatio(dbClient, user._id);
      setters['honors.count.commentVoteRatio'] = commentRatio;

      if (!currentRank || currentRank === 'novice') {
        if (pollVotesCount >= 1 && commentVotesCount >= 1 && sharesCount >= 1 && commentsCount >= 1) {
          finalRank = 'student';
        }
      } else if (currentRank === 'student') {
        if (pollVotesCount >= 3 && sharesCount >= 10 && commentRatio > 50 && blogCount >= 1) {
          finalRank = 'graduate';
        }
      } else if (currentRank === 'graduate') {
        // eslint-disable-next-line no-await-in-loop
        const consecutiveSharedWeeks = await getConsecutiveSharing(dbClient, user._id);
        if (pollVotesCount >= 10 && consecutiveSharedWeeks >= 10 && commentRatio >= 80 && commentsCount >= 100 && blogCount >= 10) {
          finalRank = 'master';
        } else {
          setters['honors.count.sharedWeeks'] = consecutiveSharedWeeks;
        }
      }

      if (currentRank !== finalRank) {
        setters['honors.rank'] = finalRank;
        setters['honors.date'] = new Date();
      }

      // eslint-disable-next-line no-await-in-loop
      await dbClient.db().collection('users').updateOne({ _id: user._id }, { $set: setters });
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

const getCommentRatio = async (dbClient, userId) => {
  const cursor = dbClient.db().collection('comments').aggregate([
    { $match: { 'user.id': userId } },
    { $group: { _id: null,
      count: { $sum: 1 },
      positives: {
        $sum: {
          $cond: [{ $gte: ['$up', '$down'] }, 1, 0],
        },
      },
    },
    },
  ]);
  const result = await cursor.next();
  if (!result) {
    return undefined;
  }
  const { positives, count } = result;
  return (count === 0) ? undefined : 100 * positives / count;
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

module.exports = async () => {
  logger.debug('Scheduler starts');
  cron.schedule(process.env.SCHEDULE_TIME, async () => calculateUserHonors(), {
    scheduled: true,
    timezone: 'Europe/Prague',
  });
};

module.exports.calculateUserHonors = calculateUserHonors;
