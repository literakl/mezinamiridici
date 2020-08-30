const axios = require('axios').default;
const { stringify } = require('flatted/cjs');
const { createLogger, format, transports } = require('winston');
const slugify = require('slugify');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const weekOfYear = require('dayjs/plugin/weekOfYear');
const sanitizeHtml = require('sanitize-html');

dayjs.extend(customParseFormat);
dayjs.extend(weekOfYear);

const edjsHTML = require('editorjs-html');

const mongo = require('../utils/mongo.js');
const api = require('../utils/api.js');

const cron = require('node-cron');
const cheerio = require('cheerio');
const cheerioAdv = require('cheerio-advanced-selectors');
const FormData = require('form-data');

const edjsParser = edjsHTML(api.edjsHtmlCustomParser());

const { combine, printf } = format;
const myFormat = printf(info => `${info.timestamp} [${info.level}]: ${info.message === Object(info.message) ? stringify(info.message) : info.message}`);
const appendTimestamp = format((info, opts) => {
  info.timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss:SSS');
  return info;
});
const logger = createLogger({
  level: 'debug',
  format: combine(
    appendTimestamp(),
    myFormat,
  ),
  transports: [
    new transports.File({
      filename: 'accidents.log',
      colorize: false,
    }),
  ],
  exitOnError: false,
});
logger.add(new transports.Console({
  format: format.simple(),
}));
logger.stream = {
  write(message) {
    logger.info(message.replace(/\n$/, ''));
  },
};

const cheerioParser = cheerioAdv.wrap(cheerio)

const ACCIDENTS_RECORDS_URL = process.env.ACCIDENTS_RECORDS_URL;
const ACCIDENTS_RECORDS_CRON = process.env.ACCIDENTS_RECORDS_CRON;
const ACCIDENTS_RECORDS_RETRY = process.env.ACCIDENTS_RECORDS_RETRY;
const dateFormatType = 'DD.MM.YYYY';

const keyArray = [
  'region', 'counts', 'deaths', 'severely', 'slighty', 'damage', 'speed', 'priority', 'passing', 'driving', 'drunk', 'other'
]
let formDataBody = {};

let currentScheduleExpression = ACCIDENTS_RECORDS_CRON;

Date.prototype.getWeek = function() {
  var dt = new Date(this.getFullYear(),0,1);
  return Math.ceil((((this - dt) / 86400000) + dt.getDay()+1)/7);
};

async function setInitFormData() {
  logger.debug('::: get content when first loading');
  let html = await getAxios(ACCIDENTS_RECORDS_URL);
  let $ = await cheerioParser.load(html);
  formDataBody = {
      'ctl00_Application_ScriptManager1_HiddenField' : $('#ctl00_Application_ScriptManager1_HiddenField').val(),
      '__EVENTTARGET' : $('#__EVENTTARGET').val(),
      '__EVENTARGUMENT' : $('#__EVENTARGUMENT').val(),
      '__VIEWSTATE' : $('#__VIEWSTATE').val(),
      '__VIEWSTATEGENERATOR' : $('#__VIEWSTATEGENERATOR').val(),
      '__EVENTVALIDATION' : $('#__EVENTVALIDATION').val(),
      'ctl00$Application$ddlKraje' : 'Česká republika',
      // 'ctl00$Application$txtDatum' : date,
      'ctl00$Application$cmdZobraz' : 'Zobrazit',
  }
}

async function parseData(dbClient, date) {
  logger.debug('::: Parsing data started');
  
  logger.debug('::: require date');
  logger.debug(date);

  formDataBody['ctl00$Application$txtDatum'] = date;
  const formData = new FormData();
  for(key in formDataBody){
    formData.append(key, (formDataBody[key]) ? formDataBody[key]: '');
  }

  const html = await getAxios(ACCIDENTS_RECORDS_URL, formData);
  const $ = await cheerioParser.load(html);

  logger.debug('::: get content when second loading');

  const regionsData = $('#celacr tr');
  let result = false;
  
  if (regionsData && regionsData.length > 0){
    result = await treatData(dbClient, regionsData, date, $);
  } else {
    result = false;
  }  
  logger.debug('The result is ');
  logger.debug(result);
  return result;
}

async function scheduleParsing() {

  const task = cron.schedule(currentScheduleExpression, async () => {
    const dbClient = await mongo.connectToDatabase();
    logger.debug('Mongo connected');
    logger.debug('Running get accident data at 06:00 at Europe/Prague timezone'); 
    logger.debug('Current schedule expression is: ');
    logger.debug(currentScheduleExpression);

    await setInitFormData();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isParsed = await parseData(dbClient, dayjs(yesterday).format(dateFormatType));

    if (!isParsed) {
      task.destroy();
      currentScheduleExpression = `*/${ACCIDENTS_RECORDS_RETRY} * * * *`;
      scheduleParsing();
    } else if (currentScheduleExpression !== ACCIDENTS_RECORDS_CRON) {
      task.destroy();
      currentScheduleExpression = ACCIDENTS_RECORDS_CRON;
      scheduleParsing();
    } else {
      const data = await getBlog(dbClient);
      storeBlogItem(dbClient, data);
    }

  }, {
    scheduled: true,
    timezone: 'Europe/Prague',
  });

}

async function getAxios(url, data) {
  let html = '';

  if(data === undefined){
      
    await axios.post(url)
    .then(response => {
      html = response.data;
    })
    .catch(console.error);

  } else {
    await axios.post(url, data, {headers : data.getHeaders()})
    .then(response => {
      html = response.data;
    })
    .catch(console.error);

  }
  return html;
}

async function treatData(dbClient, region, date, $) {
  const storeData = {
    date: new Date(date.split('.').reverse().join('-')),
    regions: [],
    total: {},
  };
  region.each((i, v) => {
    if (i === 0 || i === 1) return;
    const item = {impact:{}, reason:{}};

    if (i === region.length - 1){
      $(v).find('th').each((inx, value) => {
        const val = Number($(value).text().trim());

        if (inx === 1){
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

        if ( inx === 0) {
          item[keyArray[inx]] = $(value).text().trim();
        } else if (inx === 1){
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
  const keys = [
    'deaths', 'severely', 'slighty'
  ]

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const prevYearDate = new Date();
  prevYearDate.setYear(prevYearDate.getFullYear() - 1);
  prevYearDate.setDate(prevYearDate.getDate() - 1);
  const prevYearStartDate = new Date(prevYearDate.getFullYear(), 0, 1);
  const thisYearStartDate = new Date(new Date().getFullYear(), 0, 1);

  const prevYearData = await storeDataByDateRange(dbClient, prevYearStartDate, prevYearDate);
  const thisYearData = await storeDataByDateRange(dbClient, thisYearStartDate, yesterday);
  
  const compareData = {
    'day': { prev: {}, now: {} },
    'week': { prev: {}, now: {} },
    'month': { prev: {}, now: {} },
    'year': { prev: {}, now: {} }
  }
  initCompareData(keys, compareData);
  makeCompareData(keys, prevYearData, prevYearDate, compareData, true);
  makeCompareData(keys, thisYearData, yesterday, compareData, false);

  console.log(compareData);
  return compareData;
}

function makeCompareData(keys, allYearData, compareDate, resultData, isPrev){
  const thisWeek = compareDate.getWeek();

  allYearData.forEach((item) => {
    const date = new Date(item.date);
    if (date.toLocaleDateString() === compareDate.toLocaleDateString()) {
      if (isPrev) {
        keys.map((k) => {resultData.day.prev[k] = item.total.impact[k]});
      } else {
        keys.map((k) => {resultData.day.now[k] = item.total.impact[k]});
      }
    }
    if (date.getWeek() === compareDate.getWeek()) {
      if (isPrev) {
        keys.map((k) => {resultData.week.prev[k] += item.total.impact[k]});
      } else {
        keys.map((k) => {resultData.week.now[k] += item.total.impact[k]});
      }  
    }
    if (date.getMonth() === compareDate.getMonth()) {
      if (isPrev) {
        keys.map((k) => {resultData.month.prev[k] += item.total.impact[k]});
      } else {
        keys.map((k) => {resultData.month.now[k] += item.total.impact[k]});
      }
    }
    if (isPrev) {
      keys.map((k) => {resultData.year.prev[k] += item.total.impact[k]});
    } else {
      keys.map((k) => {resultData.year.now[k] += item.total.impact[k]});
    }
  })
}

function initCompareData(keys, obj) {
  for (v1 in obj) {
    for (v2 in obj[v1]) {
      keys.map( (i) => { obj[v1][v2][i] = 0 } );
    }
  }
}

async function storeDataByDateRange(dbClient, start, end) {
  const resultData = [];
  const startDate = new Date(start);
  const endDate = new Date(end);

  let loop = new Date(startDate);
  while(loop <= endDate){       
    const data = await getStoredData(dbClient, dayjs(loop).format('YYYY-MM-DD'));
    if (data.length > 0) {
      resultData.push(...data);
    } else {
      if (await parseData(dbClient, dayjs(loop).format(dateFormatType))) {
        resultData.push(...await getStoredData(dbClient, dayjs(loop).format('YYYY-MM-DD')));
      };
    }
    const newDate = loop.setDate(loop.getDate() + 1);
    loop = new Date(newDate);
  }
  return resultData;
}

async function getStoredData(dbClient, date) {
  return await dbClient.db().collection('accidents').find({ date: new Date(date) }).toArray();
}

async function storeBlogItem(dbClient, data) {
  const blogId = mongo.generateTimeId();
  const publishDate = dayjs().subtract(1, 'day');
  const title = `A States for ${dayjs(publishDate).format(dateFormatType)}`;
  const picture = process.env.STREAM_PICTURES_PATH + '/' + process.env.STREAM_PICTURES_DEFAULT;
  const blogAuthor = await mongo.getIdentity(dbClient, process.env.COMPARE_BLOG_AUTHOR);
  const source = {date: new Date().getTime(), blocks:[], version: '2.18.0'};

  const lastYearDate = publishDate.subtract(1, 'year');

  for (key in data) {
    const headerItem = { 'type': 'header', 'data': { 'text': `Compare with ${(key === 'year')?'':key + ' of'} last year`, 'level': 3 } };
    const tableItem = { 'type': 'table', 'data': { 'content': [] } };
    const thArray = [];
    const tdArray = [];
    for (dayKey in data[key]) {
      for (subKey in data[key][dayKey]) {
        let txt = '';
        switch (key) {
          case 'day':
            txt = (dayKey === 'prev') ? `${subKey}\n(${lastYearDate.format(dateFormatType)})` : `${subKey}\n(${publishDate.format(dateFormatType)})`;
            break;
          case 'week':
            txt = (dayKey === 'prev') ? `${subKey}\n(${lastYearDate.week()})` : `${subKey}\n(${publishDate.week()})`;
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
  
  await insertItem(dbClient, blogId, title, source, blogAuthor, publishDate, picture, []);
}

function insertItem(dbClient, blogId, title, source, author, publishDate, picture, tags) {
  let content = '';
  edjsParser.parse(source).forEach((item) => {
    content += item;
  });
  const slug = slugify(title, { lower: true, strict: true });
  const blog = {
    _id: blogId,
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
  
  dbClient.db().collection('items').insertOne(blog);
}

exports.scheduleParsing = scheduleParsing;
exports.parseData = parseData;