const dayjs = require('dayjs');

const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { log } = require('../../utils/logging');
const DATE_FORMAT = 'YYYY-MM-DD';

require('../../utils/path_env');

module.exports = (app) => {
  app.options('/v1/accidents/last', auth.cors);
  app.options('/v1/accidents/:day', auth.cors);

  app.get('/v1/accidents/last', auth.cors, async (req, res) => {
    log.debug('Get last day accidents summary');

    try {
      const dbClient = await mongo.connectToDatabase();
      const result = await dbClient.db().collection('accidents')
        .find({}, { projection: { date: 1, total: 1}})
        .sort({date: -1})
        .limit(1)
        .toArray();

      if (result.length > 0) {
        return api.sendResponse(res, api.createResponse(result[0]));
      } else {
        return api.sendResponse(res, api.createResponse({}));
      }
    } catch (err) {
      log.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get last day accidents summary', 'sign-in.something-went-wrong'));
    }
  });

  app.get('/v1/accidents/:day', api.statsAPILimits, auth.cors, async (req, res) => {
    log.debug('Get selected day accidents summary');

    try {
      const { day } = req.params;
      const date = dayjs(day, DATE_FORMAT, true);
      const dbClient = await mongo.connectToDatabase();

      const dayData = await dbClient.db().collection('accidents').findOne({ date: date.toDate()})
      if (! dayData) {
        return api.sendResponse(res, api.createResponse());
      }

      const thisYearStartDate = date.startOf('year');
      const thisYearDate = await fetchByDateRange(dbClient, thisYearStartDate, date);
      if (thisYearDate.length === 0) {
        return api.sendResponse(res, api.createResponse());
      }

      const yearAgoDate = date.subtract(1, 'year');
      const lastYearStartDate = yearAgoDate.startOf('year');
      const prevYearData = await fetchByDateRange(dbClient, lastYearStartDate, yearAgoDate);

      const data = compareData(date, date.subtract(1, 'year'), prevYearData, thisYearDate);
      data.day = dayData;
      data.lastYearValue = date.year() - 1;
      data.thisYearValue = date.year();
      return api.sendResponse(res, api.createResponse(data));
    } catch (err) {
      log.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get selected day accidents summary', 'sign-in.something-went-wrong'));
    }
  });
}

async function fetchByDateRange(dbClient, start, end) {
  const query = { date: { $gte: start.toDate(), $lte: end.toDate() } };
  return dbClient.db().collection('accidents').find(query, { regions: 0 }).toArray();
}

function compareData(thisYearDate, yearAgoDate, prevYearData, thisYearData) {
  const summary = {
    lastYear: {
      day: {}, week: emptyStats(), month: emptyStats(), year: emptyStats(),
    },
    thisYear: {
      day: {}, week: emptyStats(), month: emptyStats(), year: emptyStats(),
    },
  };
  aggregateData(yearAgoDate, prevYearData, summary.lastYear);
  aggregateData(thisYearDate, thisYearData, summary.thisYear);
  return summary;
}

function emptyStats() {
  return {
    count: 0,
    impact: { deaths: 0, severely: 0, slightly: 0, damage: 0 },
    reason: { speed: 0, giveway: 0, passing: 0, mistake: 0, drunk: 0, other: 0 },
  };
}

function aggregateData(now, yearData, summary) {
  yearData.forEach((day) => {
    const date = dayjs(day.date);
    if (date.isSame(now, 'day')) {
      summary.day = day.total;
    }
    if (date.isSame(now, 'week')) {
      add(day.total, summary.week);
    }
    if (date.isSame(now, 'month')) {
      add(day.total, summary.month);
    }
    add(day.total, summary.year);
  });
}

function add(total, summary) {
  summary.count += total.count;
  summary.impact.deaths += total.impact.deaths;
  summary.impact.severely += total.impact.severely;
  summary.impact.slightly += total.impact.slightly;
  summary.impact.damage += total.impact.damage;
  summary.reason.speed += total.reason.speed;
  summary.reason.giveway += total.reason.giveway;
  summary.reason.passing += total.reason.passing;
  summary.reason.mistake += total.reason.mistake;
  summary.reason.drunk += total.reason.drunk;
  summary.reason.other += total.reason.other;
}
