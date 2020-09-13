// eslint-disable-next-line import/no-extraneous-dependencies
const got = require('got');

const api = got.extend({
  prefixUrl: 'http://localhost:3000/v1/',
  throwHttpErrors: false,
  headers: {
    'content-type': 'application/json; charset=utf-8',
  },
});
const bff = got.extend({
  prefixUrl: 'http://localhost:3000/bff/',
  throwHttpErrors: false,
  headers: {
    'content-type': 'application/json; charset=utf-8',
  },
});

function getAuthHeader(jwt) {
  const headers = { };
  if (jwt) {
    headers.Authorization = `bearer ${jwt}`;
  }
  return headers;
}

function deepCopy(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.reduce((arr, item, i) => {
      arr[i] = deepCopy(item);
      return arr;
    }, []);
  }

  if (obj instanceof Object) {
    return Object.keys(obj).reduce((newObj, key) => {
      newObj[key] = deepCopy(obj[key]);
      return newObj;
    }, {});
  } else {
    // suppress warnings
    return obj;
  }
}

function sleep(time) {
  return new Promise(res => setTimeout(() => { res(); }, time));
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function getActivityCounter(dbClient, userId, property) {
  const user = await dbClient.db().collection('users').findOne({ _id: userId }, { honors: 1 });
  return user.honors.count[property];
}

async function getUserRank(dbClient, userId) {
  const user = await dbClient.db().collection('users').findOne({ _id: userId }, { honors: 1 });
  return user.honors.rank;
}

async function resetHonors(dbClient) {
  return dbClient.db().collection('users').updateMany({ }, { $set: { honors: {
    rank: 'novice',
    count: {
      pollVotes: 0,
      comments: 0,
      commentVotes: 0,
      blogs: 0,
      shares: 0,
    },
  } } });
}

module.exports.api = api;
module.exports.bff = bff;
module.exports.getAuthHeader = getAuthHeader;
module.exports.deepCopy = deepCopy;
module.exports.sleep = sleep;
module.exports.shuffle = shuffle;
module.exports.getActivityCounter = getActivityCounter;
module.exports.getUserRank = getUserRank;
module.exports.resetHonors = resetHonors;
