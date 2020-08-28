const axios = require('axios').default;
const logger = require('../utils/logging');
const mongo = require('../utils/mongo.js');

const cron = require('node-cron');
const cheerio = require('cheerio');
const cheerioAdv = require('cheerio-advanced-selectors');
const dateFormat = require('dateformat');
const FormData = require('form-data');

const cheerioParser = cheerioAdv.wrap(cheerio)

const ACCIDENTS_RECORDS_URL = process.env.ACCIDENTS_RECORDS_URL;
const ACCIDENTS_RECORDS_CRON = process.env.ACCIDENTS_RECORDS_CRON;
const ACCIDENTS_RECORDS_RETRY = process.env.ACCIDENTS_RECORDS_RETRY;
const dateFormatType = 'dd.mm.yyyy';

const keyArray = [
  'region', 'counts', 'deaths', 'severely', 'slighty', 'damage', 'speed', 'priority', 'passing', 'driving', 'drunk', 'other'
]

let currentSchedule = ACCIDENTS_RECORDS_CRON;

async function parseData(date) {
  logger.debug('Parsing data started');
  
  let html = await getAxios(ACCIDENTS_RECORDS_URL);
  let $ = await cheerioParser.load(html);
  // const body = {
  //     'ctl00_Application_ScriptManager1_HiddenField' : $('#ctl00_Application_ScriptManager1_HiddenField').val(),
  //     '__EVENTTARGET' : $('#__EVENTTARGET').val(),
  //     '__EVENTARGUMENT' : $('#__EVENTARGUMENT').val(),
  //     '__VIEWSTATE' : $('#__VIEWSTATE').val(),
  //     '__VIEWSTATEGENERATOR' : $('#__VIEWSTATEGENERATOR').val(),
  //     '__EVENTVALIDATION' : $('#__EVENTVALIDATION').val(),
  //     'ctl00$Application$ddlKraje' : 'Česká republika',
  //     'ctl00$Application$txtDatum' : date,
  //     'ctl00$Application$cmdZobraz' : 'Zobrazit',
  // }
  
  // const formData = new FormData();
  // for(key in body){
  //   formData.append(key, (body[key]) ? body[key]: '');
  // }

  // html = await getAxios(ACCIDENTS_RECORDS_URL, formData);
  // $ = await cheerioParser.load(html);
  const regionsData = $('#celacr tr');
  let result = false;
  
  if (regionsData && regionsData.length > 0){
    result = await treatData(regionsData, date, $);
  } else {
    result = false;
  }

  return result;
}

function scheduleParsing() {

  const task = cron.schedule(currentSchedule, async () => {
    logger.debug('Running get accident data at 06:00 at Europe/Prague timezone');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    // console.log(dateFormat(yesterday, dateFormatType))

    const isParsed = await parseData(dateFormat(yesterday, dateFormatType));

    // if (!isParsed) {
    //   task.destroy();
    //   currentSchedule = `*/${ACCIDENTS_RECORDS_RETRY} * * * *`;
    //   scheduleParsing();
    // } else if (currentSchedule !== ACCIDENTS_RECORDS_CRON) {
    //   task.destroy();
    //   currentSchedule = ACCIDENTS_RECORDS_CRON;
    //   scheduleParsing();
    // }

    console.log('pased ===', isParsed)
    
    task.destroy();

  }, {
    scheduled: true,
    timezone: 'Europe/Prague',
  });

}

async function getAxios(url, body, header = { headers: { } }){
  let html = '';

  if(body === undefined){
      
    await axios.post(url)
    .then(response => {
      html = response.data;
      console.log('axios ===>', html.length);
    })
    .catch(console.error);

  } else {
    
    await axios.post(url, body, header)
    .then(response => {
      html = response.data;
      console.log('axios ===>', html.length);
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