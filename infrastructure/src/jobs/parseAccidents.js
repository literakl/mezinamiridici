const axios = require('axios').default;
const { createLogger, format, transports } = require('winston');
const mongo = require('../utils/mongo.js');

const cron = require('node-cron');
const cheerio = require('cheerio');
const cheerioAdv = require('cheerio-advanced-selectors');
const dateFormat = require('dateformat');
const FormData = require('form-data');

const { combine, printf } = format;
const myFormat = printf(info => `${info.timestamp} [${info.level}]: ${info.message === Object(info.message) ? stringify(info.message) : info.message}`);
const appendTimestamp = format((info, opts) => {
  info.timestamp = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:s:l');
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
const dateFormatType = 'dd.mm.yyyy';

const keyArray = [
  'region', 'counts', 'deaths', 'severely', 'slighty', 'damage', 'speed', 'priority', 'passing', 'driving', 'drunk', 'other'
]

let currentScheduleExpression = ACCIDENTS_RECORDS_CRON;

async function parseData(date) {
  logger.debug('::: Parsing data started');
  
  let html = await getAxios(ACCIDENTS_RECORDS_URL);
  let $ = await cheerioParser.load(html);
  const body = {
      'ctl00_Application_ScriptManager1_HiddenField' : $('#ctl00_Application_ScriptManager1_HiddenField').val(),
      '__EVENTTARGET' : $('#__EVENTTARGET').val(),
      '__EVENTARGUMENT' : $('#__EVENTARGUMENT').val(),
      '__VIEWSTATE' : $('#__VIEWSTATE').val(),
      '__VIEWSTATEGENERATOR' : $('#__VIEWSTATEGENERATOR').val(),
      '__EVENTVALIDATION' : $('#__EVENTVALIDATION').val(),
      'ctl00$Application$ddlKraje' : 'Česká republika',
      'ctl00$Application$txtDatum' : date,
      'ctl00$Application$cmdZobraz' : 'Zobrazit',
  }
  
  logger.debug('::: require date');
  logger.debug(date);
  logger.debug('::: get content when first loading');

  const formData = new FormData();
  for(key in body){
    formData.append(key, (body[key]) ? body[key]: '');
  }

  html = await getAxios(ACCIDENTS_RECORDS_URL, formData);
  $ = await cheerioParser.load(html);

  logger.debug('::: get content when second loading');

  const regionsData = $('#celacr tr');
  let result = false;
  
  if (regionsData && regionsData.length > 0){
    result = await treatData(regionsData, date, $);
  } else {
    result = false;
  }  
  logger.debug('The result is ');
  logger.debug(result);
  return result;
}

function scheduleParsing() {

  const task = cron.schedule(currentScheduleExpression, async () => {
    logger.debug('Running get accident data at 06:00 at Europe/Prague timezone'); 
    logger.debug('Current schedule expression is: ');
    logger.debug(currentScheduleExpression);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isParsed = await parseData(dateFormat(yesterday, dateFormatType));

    if (!isParsed) {
      task.destroy();
      currentScheduleExpression = `*/${ACCIDENTS_RECORDS_RETRY} * * * *`;
      scheduleParsing();
    } else if (currentScheduleExpression !== ACCIDENTS_RECORDS_CRON) {
      task.destroy();
      currentScheduleExpression = ACCIDENTS_RECORDS_CRON;
      scheduleParsing();
    }

  }, {
    scheduled: true,
    timezone: 'Europe/Prague',
  });

}

async function getAxios(url, data){
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

async function treatData(region, date, $){  
  const dbClient = await mongo.connectToDatabase();
  logger.debug('Mongo connected');
  
  const storeData = {
    date,
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


exports.scheduleParsing = scheduleParsing;
exports.parseData = parseData;