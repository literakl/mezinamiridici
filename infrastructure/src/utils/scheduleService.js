const mongo = require('./mongo.js');
const api = require('./api.js');
const auth = require('./authenticate');
const logger = require('./logging');
const cron = require('node-cron');


module.exports = async () => {
  const dbClient = await mongo.connectToDatabase();
  logger.debug('Mongo connected to schedule start');

  // cron.schedule('0 0 * * *', () => { // TODO this is normal code line
  const task = cron.schedule('*/2 * * * * *', async () => { // TODO for dev testing

    logger.debug('Running a job at 00:00 at Europe/Prague timezone');

    const userArray = await getUserIdArray(dbClient);

    userArray.forEach(async (userId, idx) => {
      let rank = '';
      const pollVotesCount = await getPollVoteCount(dbClient, userId);

      const commentVotesCount = await getCommentVotesCount(dbClient, userId);

      const shareLinkCount = await getShareLinkCount(dbClient, userId);

      const commentedCount = await getCommentedCount(dbClient, userId);

      const positiveCommentsVotesCount = await getPositiveCommentsVotesCount(dbClient, userId);

      const blogCount = await getBlogCount(dbClient, userId);

      const positivePercent = await getPositivePercent(dbClient, userId);

      const consecutiveSharing = await getConsecutiveSharing(dbClient, userId, 10);
      
      if(pollVotesCount >= 10 && consecutiveSharing && positivePercent >= 80 && commentedCount >= 100 && blogCount >= 10) {
        rank = "master";
      }else if(pollVotesCount >= 3 && shareLinkCount >= 10 && positiveCommentsVotesCount >= 5 && blogCount >= 1){
        rank = "graduate";
      }else if(pollVotesCount >= 1 &&  commentVotesCount >= 1 && shareLinkCount >= 1 && commentedCount >= 1){
        rank = "student";
      }else{
        rank = "novice";
      };
            
      await dbClient.db().collection('users').updateOne({ _id: userId }, {
        $set: {'honors.rank': rank}
      });
    })

    task.destroy(); // TODO for dev testing. should remove after test.

  }, {
    scheduled: true,
    timezone: 'Europe/Prague'
  });

}

const getUserIdArray = async (dbClient) => {
  let arr = [];
  await dbClient.db().collection('users').find().project({ id: 1 }).forEach((item) => {
    arr.push(item._id);
  });
  return arr;
}

const getPollVoteCount = async (dbClient, userId) => {
  return await dbClient.db().collection('poll_votes').find({ user:userId }).count();
}

const getCommentVotesCount = async (dbClient, userId) => {
  return await dbClient.db().collection('comment_votes').find({ 'user.id': userId }).count();
}

const getShareLinkCount = async (dbClient, userId) => {
  return await dbClient.db().collection('link_share').find({ user: userId }).count();
}

const getCommentedCount = async (dbClient, userId) => {
  return await dbClient.db().collection('comments').find({ 'user.id': userId }).count();
}

const getPositiveCommentsVotesCount = async (dbClient, userId) => {
  let arr = [];
  await dbClient.db().collection('comments').aggregate([
    { $match: { 'user.id': userId, up: { $gt: 1 }} },
    { $group: { _id: "$itemId", count: { $sum: 1 } } }
 ]).forEach((item)=>{ arr.push(item) });

 return arr.length;

}

const getBlogCount = async (dbClient, userId) => {
  return await dbClient.db().collection('items').find({ 'info.author.id': userId }).count();
}

const getPositivePercent = async (dbClient, userId) => {
  let positive = 0, negative = 0;
  await dbClient.db().collection('comments').aggregate([
    { $match: { 'user.id': userId }},
    { $group: { _id: '$user.id', total_p: { $sum: '$up' }, total_n: { $sum: '$down' }}}
  ]).forEach((item)=>
  {
    positive = item.total_p;
    negative = item.total_n;
  });
  return (positive === 0 && negative === 0) ? 0: 100 * positive/(positive + negative);
}

const getConsecutiveSharing = async (dbClient, userId, consecutive = 5) => {
  const weekArray = [];
  const pipeline = [
    {
        $match: {
          user: userId,
        }
    },
    {
        $group: {
            _id: { $week: '$date' },
            documentCount: { $sum: 1 }
        }
    }
  ];
  await dbClient.db().collection('link_share').aggregate(pipeline).forEach((item) => {
    weekArray.push(item._id);
  });

  if(weekArray.length === 0) return false;

  const maxW = Math.max.apply(null, weekArray);
  if( maxW > 51){
    weekArray.forEach((item, index) => {
      if((maxW - item) > consecutive) weekArray[index] = item + maxW;
    })
  }
  weekArray.sort((a, b)=>{return a - b});
  return consecutiveDigits(weekArray, consecutive);
}


const consecutiveDigits = (arr, consecutive) => {
  var curr,
      prev,
      count = 0;
  for(var i = 0; i < arr.length; ++i) {
      curr = arr[i];
      if(count === 0){
          ++count;
      }
      else if(prev + 1 === curr){
          ++count;
          if(count === consecutive){
              return true;
          }
      }
      prev = curr;
  }
  return false;
}
