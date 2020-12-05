const { CronJob } = require('cron');
const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');

const { jobLogger } = require('../utils/logging');
const mongo = require('../utils/mongo.js');
const { findLastIndex } = require('../utils/helpers');

const { CALCULATE_USER_RANKS_SCHEDULE } = process.env;

dayjs.extend(isoWeek);

const calculateUserHonors = async () => {
  jobLogger.info('Running a job to calculate the user ranks', { label: 'calculateUserRanks' });

  const dbClient = await mongo.connectToDatabase();
  let users = await getUsers(dbClient, undefined, 100);
  while (users.length > 0) {
    let user;
    for (let i = 0; i < users.length; i += 1) {
      const setters = {};
      user = users[i];
      const currentRank = (user.honors) ? user.honors.rank : '';
      let finalRank = user.honors.rank || 'novice';
      const pollVotesCount = user.honors.count.pollVotes, commentVotesCount = user.honors.count.commentVotes,
        commentsCount = user.honors.count.comments, blogCount = user.honors.count.blogs, sharesCount = user.honors.count.shares;
      // eslint-disable-next-line no-await-in-loop
      const commentRatio = await getCommentRatio(dbClient, user._id);
      setters['honors.count.commentVoteRatio'] = commentRatio;

      if (!currentRank || currentRank === 'novice') {
        if (pollVotesCount >= 1 && commentVotesCount >= 1 && sharesCount >= 1 && commentsCount >= 1) {
          finalRank = 'student';
        }
      } else if (currentRank === 'student') {
        if (pollVotesCount >= 3 && sharesCount >= 10 && commentRatio > 66 && blogCount >= 1) {
          finalRank = 'graduate';
        }
      } else if (currentRank === 'graduate') {
        let sharingWeeksCount = user.honors.count.sharingWeeks, consecutive;
        if ((sharingWeeksCount || 0) < 10) {
          // eslint-disable-next-line no-await-in-loop
          consecutive = await getConsecutiveSharing(dbClient, user._id);
          // eslint-disable-next-line prefer-destructuring
          sharingWeeksCount = consecutive.sharingWeeksCount;
        }

        if (pollVotesCount >= 10 && sharingWeeksCount >= 10 && commentRatio >= 80 && commentsCount >= 100 && blogCount >= 10) {
          finalRank = 'expert';
        }

        if (sharingWeeksCount < 10) {
          setters['honors.count.sharingWeeks'] = sharingWeeksCount;
          setters['honors.sharingWeeksList'] = consecutive.sharingWeeksList;
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
    { $match: { 'author.id': userId } },
    { $group: {
      _id: null,
      count: { $sum: 1 },
      positives: {
        $sum: {
          $cond: [{ $gte: ['$up', '$down'] }, 1, 0],
        },
      } },
    },
  ]);
  const result = await cursor.next();
  if (!result) {
    return undefined;
  }
  const { positives, count } = result;
  return (count === 0) ? undefined : 100 * positives / count;
};

const getConsecutiveSharing = async (dbClient, userId) => {
  const start = dayjs().subtract(10, 'week'), limit = start.subtract(1, 'week');
  const pipeline = [
    { $match: { user: userId, date: { $gte: limit.toDate() } } },
    {
      $group: {
        _id: { $isoWeek: '$date' },
        shares: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ];
  const foundWeeks = await dbClient.db().collection('link_shares').aggregate(pipeline).toArray();
  return calculateConsecutiveSharing(start, foundWeeks);
};

function calculateConsecutiveSharing(date, foundWeeks) {
  const weeks = [];
  let start = date, index = 0, week;
  for (let i = 0; i < 10;) {
    week = start.isoWeek();
    while (index < foundWeeks.length && foundWeeks[index]._id < week) {
      index += 1;
    }

    if (index < foundWeeks.length && foundWeeks[index]._id === week) {
      if (foundWeeks[index].shares > 0) {
        weeks.push({ week, shared: true });
      } else {
        weeks.push({ week, shared: false });
      }
      index += 1;
    } else {
      weeks.push({ week, shared: false });
    }
    start = start.add(1, 'week');
    i += 1;
  }

  // let count = weeks.reverse().findIndex(aWeek => !aWeek.shared);
  let count = findLastIndex(weeks, aWeek => !aWeek.shared);
  if (count === -1) {
    count = 0;
  } else {
    count = 9 - count;
  }

  return { sharingWeeksCount: count, sharingWeeksList: weeks };
}

function scheduleCalculation() {
  jobLogger.info(`Rank job scheduled to run at ${CALCULATE_USER_RANKS_SCHEDULE}`, { label: 'calculateUserRanks' });
  const job = new CronJob(CALCULATE_USER_RANKS_SCHEDULE, async () => calculateUserHonors);
  job.start();
}

exports.schedule = scheduleCalculation;
exports.calculateUserHonors = calculateUserHonors;
exports.calculateConsecutiveSharing = calculateConsecutiveSharing;
