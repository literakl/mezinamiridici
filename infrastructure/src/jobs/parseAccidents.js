import { jobLogger as logger } from '../utils/logging';

const axios = require('axios').default;
const slugify = require('slugify');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const weekOfYear = require('dayjs/plugin/weekOfYear');
const { CronJob } = require('cron');
const cheerio = require('cheerio');
const cheerioAdv = require('cheerio-advanced-selectors');
const FormData = require('form-data');
const edjsHTML = require('editorjs-html');

const mongo = require('../utils/mongo.js');
const api = require('../utils/api.js');

dayjs.extend(customParseFormat);
dayjs.extend(weekOfYear);

const edjsParser = edjsHTML(api.edjsHtmlCustomParser());
const cheerioParser = cheerioAdv.wrap(cheerio);

const { ACCIDENTS_STATS_URL, SCHEDULE_ACCIDENTS_STATS, ACCIDENTS_STATS_RETRY_MINUTES } = process.env;
const dateFormatType = 'DD.MM.YYYY';

const keyArray = [
  'region', 'counts', 'deaths', 'severely', 'slightly', 'damage', 'speed', 'priority', 'passing', 'driving', 'drunk', 'other',
];

async function scheduleParsing() {
  const job = new CronJob(SCHEDULE_ACCIDENTS_STATS, async () => doJob);
  job.start();
}

async function doJob() {
  logger.info('Connecting to server');
  const formDataBody = await getInitialFormData();
  const yesterday = dayjs().subtract(1, 'day');
  const dbClient = await mongo.connectToDatabase();
  // todo pass Date and format it when needed
  const isParsed = await parseData(dbClient, formDataBody, dayjs(yesterday).format(dateFormatType));
  if (!isParsed) {
    logger.info('Data not available, rescheduling');
    const nextTime = dayjs().add(ACCIDENTS_STATS_RETRY_MINUTES, 'minute').toDate();
    const job = new CronJob(nextTime, async () => doJob);
    job.start();
  } else {
    logger.info('Data fetched, creating new article');
    const data = await getBlog(dbClient);
    await storeBlogItem(dbClient, data);
  }
}

async function getInitialFormData() {
  logger.debug('Initial loading to load the bloody form');
  const html = await getPage(ACCIDENTS_STATS_URL);
  const $ = await cheerioParser.load(html);
  return {
    ctl00_Application_ScriptManager1_HiddenField: $('#ctl00_Application_ScriptManager1_HiddenField').val(),
    __EVENTTARGET: $('#__EVENTTARGET').val(),
    __EVENTARGUMENT: $('#__EVENTARGUMENT').val(),
    __VIEWSTATE: $('#__VIEWSTATE').val(),
    __VIEWSTATEGENERATOR: $('#__VIEWSTATEGENERATOR').val(),
    __EVENTVALIDATION: $('#__EVENTVALIDATION').val(),
    ctl00$Application$ddlKraje: 'Česká republika',
    ctl00$Application$cmdZobraz: 'Zobrazit',
  };
}

async function parseData(dbClient, date, formDataBody) {
  logger.debug(`Data retrieval for ${date} started`);
  formDataBody.ctl00$Application$txtDatum = date;
  const formData = new FormData();
  // eslint-disable-next-line no-restricted-syntax
  for (const key in formDataBody) {
    // eslint-disable-next-line no-prototype-builtins
    if (formDataBody.hasOwnProperty(key)) {
      formData.append(key, (formDataBody[key]) ? formDataBody[key] : '');
    }
  }

  const html = await getPage(ACCIDENTS_STATS_URL, formData);
  const $ = await cheerioParser.load(html);
  logger.debug('Page downloaded');

  const regionsData = $('#celacr tr');
  let result;
  if (regionsData && regionsData.length > 0) {
    result = await saveData(dbClient, regionsData, date, $);
    logger.debug('Data stored in Mongo');
    return result;
  } else {
    return false;
  }
}

async function getPage(url, data) {
  let html = '';
  if (data === undefined) {
    await axios.post(url)
      .then((response) => {
        html = response.data;
      })
      .catch(logger.error);
  } else {
    await axios.post(url, data, { headers: data.getHeaders() })
      .then((response) => {
        html = response.data;
      })
      .catch(logger.error);
  }
  return html;
}

async function saveData(dbClient, region, date, $) {
  const storeData = {
    date: new Date(date.split('.').reverse().join('-')),
    regions: [],
    total: {},
  };
  region.each((i, v) => {
    if (i === 0 || i === 1) return;
    const item = { impact: {}, reason: {} };

    if (i === region.length - 1) {
      $(v).find('th').each((inx, value) => {
        const val = Number($(value).text().trim());

        if (inx === 1) {
          item[keyArray[inx]] = val;
        } else if ([2, 3, 4, 5].indexOf(inx) > -1) {
          item.impact[keyArray[inx]] = val;
        } else if ([6, 7, 8, 9, 10, 11].indexOf(inx) > -1) {
          item.reason[keyArray[inx]] = val;
        }
      });
      storeData.total = item;
    } else {
      $(v).find('td').each((inx, value) => {
        const val = Number($(value).find('span').text());

        if (inx === 0) {
          item[keyArray[inx]] = $(value).text().trim();
        } else if (inx === 1) {
          item[keyArray[inx]] = val;
        } else if ([2, 3, 4, 5].indexOf(inx) > -1) {
          item.impact[keyArray[inx]] = val;
        } else if ([6, 7, 8, 9, 10, 11].indexOf(inx) > -1) {
          item.reason[keyArray[inx]] = val;
        }
      });
      storeData.regions.push(item);
    }
  });

  await dbClient.db().collection('accidents').insertOne(storeData);
  return true;
}

async function getBlog(dbClient) {
  const keys = ['deaths', 'severely', 'slighty'];
  const yesterday = dayjs().subtract(1, 'day').toDate();
  const prevYearDate = dayjs().subtract(1, 'day').subtract(1, 'year').toDate();
  const prevYearStartDate = new Date(prevYearDate.getFullYear(), 0, 1);
  const thisYearStartDate = new Date(new Date().getFullYear(), 0, 1);

  const prevYearData = await storeDataByDateRange(dbClient, prevYearStartDate, prevYearDate);
  const thisYearData = await storeDataByDateRange(dbClient, thisYearStartDate, yesterday);

  const compareData = {
    day: { prev: {}, now: {} },
    week: { prev: {}, now: {} },
    month: { prev: {}, now: {} },
    year: { prev: {}, now: {} },
  };
  initCompareData(keys, compareData);
  makeCompareData(keys, prevYearData, prevYearDate, compareData, true);
  makeCompareData(keys, thisYearData, yesterday, compareData, false);

  console.log(compareData);
  return compareData;
}

function makeCompareData(keys, allYearData, compareDate, resultData, isPrev) {
  allYearData.forEach((item) => {
    const date = new Date(item.date);
    if (date.toLocaleDateString() === compareDate.toLocaleDateString()) {
      if (isPrev) {
        keys.map((k) => { resultData.day.prev[k] = item.total.impact[k]; });
      } else {
        keys.map((k) => { resultData.day.now[k] = item.total.impact[k]; });
      }
    }
    if (dayjs(date).week() === dayjs(compareDate).week()) {
      if (isPrev) {
        keys.map((k) => { resultData.week.prev[k] += item.total.impact[k]; });
      } else {
        keys.map((k) => { resultData.week.now[k] += item.total.impact[k]; });
      }
    }
    if (date.getMonth() === compareDate.getMonth()) {
      if (isPrev) {
        keys.map((k) => { resultData.month.prev[k] += item.total.impact[k]; });
      } else {
        keys.map((k) => { resultData.month.now[k] += item.total.impact[k]; });
      }
    }
    if (isPrev) {
      keys.map((k) => { resultData.year.prev[k] += item.total.impact[k]; });
    } else {
      keys.map((k) => { resultData.year.now[k] += item.total.impact[k]; });
    }
  });
}

function initCompareData(keys, obj) {
  for (const v1 in obj) {
    for (const v2 in obj[v1]) {
      keys.map((i) => { obj[v1][v2][i] = 0; });
    }
  }
}

async function storeDataByDateRange(dbClient, start, end) {
  const resultData = [];
  const startDate = new Date(start);
  const endDate = new Date(end);

  let loop = new Date(startDate);
  while (loop <= endDate) {
    const data = await getStoredData(dbClient, dayjs(loop).format('YYYY-MM-DD'));
    if (data.length > 0) {
      resultData.push(...data);
    } else if (await parseData(dbClient, dayjs(loop).format(dateFormatType))) {
      resultData.push(...await getStoredData(dbClient, dayjs(loop).format('YYYY-MM-DD')));
    }
    const newDate = loop.setDate(loop.getDate() + 1);
    loop = new Date(newDate);
  }
  return resultData;
}

async function getStoredData(dbClient, date) {
  return dbClient.db().collection('accidents').find({ date: new Date(date) }).toArray();
}

async function storeBlogItem(dbClient, data) {
  const publishDate = dayjs().subtract(1, 'day');
  const title = `A States for ${dayjs(publishDate).format(dateFormatType)}`;
  const picture = `${process.env.STREAM_PICTURES_PATH}/${process.env.STREAM_PICTURES_DEFAULT}`;
  const blogAuthor = await mongo.getIdentity(dbClient, process.env.COMPARE_BLOG_AUTHOR);
  const source = { date: new Date().getTime(), blocks: [], version: '2.18.0' };

  const lastYearDate = publishDate.subtract(1, 'year');
  const week = publishDate.week();

  for (const key in data) {
    const headerItem = { type: 'header', data: { text: `Compare with ${(key === 'year') ? '' : `${key} of`} last year`, level: 3 } };
    const tableItem = { type: 'table', data: { content: [] } };
    const thArray = [];
    const tdArray = [];
    for (const dayKey in data[key]) {
      for (const subKey in data[key][dayKey]) {
        let txt = '';
        switch (key) {
          case 'day':
            txt = (dayKey === 'prev') ? `${subKey}\n(${lastYearDate.format(dateFormatType)})` : `${subKey}\n(${publishDate.format(dateFormatType)})`;
            break;
          case 'week':
            txt = (dayKey === 'prev') ? `${subKey}\n(${week})` : `${subKey}\n(${week})`;
            break;
          case 'month':
            txt = (dayKey === 'prev') ? `${subKey}\n(${lastYearDate.month() + 1})` : `${subKey}\n(${publishDate.month() + 1})`;
            break;
          case 'year':
            txt = (dayKey === 'prev') ? `${subKey}\n(${lastYearDate.year()})` : `${subKey}\n(${publishDate.year()})`;
        }
        thArray.push(txt);
        tdArray.push(data[key][dayKey][subKey]);
      }
    }
    tableItem.data.content.push(thArray, tdArray);
    source.blocks.push(headerItem, tableItem);
  }

  await insertItem(dbClient, title, source, blogAuthor, publishDate, picture, []);
}

function insertItem(dbClient, title, source, author, publishDate, picture, tags) {
  let content = '';
  edjsParser.parse(source).forEach((item) => {
    content += item;
  });
  const slug = slugify(title, { lower: true, strict: true });
  const blog = {
    type: 'blog',
    info: {
      author: {
        nickname: author.nickname,
        id: author.userId,
      },
      caption: title,
      slug,
      date: publishDate.toDate(),
      picture,
      tags,
    },
    data: {
      content,
      source,
    },
    comments: {
      count: 0,
      last: null,
    },
  };

  return dbClient.db().collection('items').insertOne(blog);
}

exports.scheduleParsing = scheduleParsing;
exports.parseData = parseData;
