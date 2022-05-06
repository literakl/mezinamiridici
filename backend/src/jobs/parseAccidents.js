const axios = require('axios').default;
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const { CronJob } = require('cron');
const cheerio = require('cheerio');
const FormData = require('form-data');

const { configureLoggers } = require('../utils/logging');
const mongo = require('../utils/mongo.js');

dayjs.extend(customParseFormat);
const DATE_FORMAT = 'DD.MM.YYYY';

const { ACCIDENTS_STATS_URL, ACCIDENTS_STATS_SCHEDULE, ACCIDENTS_STATS_RETRY_MINUTES, ACCIDENTS_STATS_RETRY_MAXIMUM } = process.env;

const jobLogger = configureLoggers('parseAccidents.js', true, 'parseAccidents');

const KEYS = [
  'region', 'count', 'deaths', 'severely', 'slightly', 'damage', 'speed', 'giveway', 'passing', 'mistake', 'drunk', 'other',
];
const REGIONS = {
  PRG: 'Praha',
  SC: 'Středočeský',
  JC: 'Jihočeský',
  PLS: 'Plzeňský',
  KV: 'Karlovarský',
  UST: 'Ústecký',
  LBR: 'Liberecký',
  KH: 'Královéhradecký',
  PRD: 'Pardubický',
  VSC: 'Vysočina',
  JM: 'Jihomoravský',
  OLM: 'Olomoucký',
  ZLN: 'Zlínský',
  MS: 'Moravskoslezský',
};

let retried = 0;

async function doRun() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.length > 2) {
    exitWithHelp();
  }

  if (args[0] === 'true') {
    scheduleParsing();
    return;
  }

  let current, until;
  current = dayjs(args[1], DATE_FORMAT, true);
  if (args.length === 3) {
    until = dayjs(args[2], DATE_FORMAT, true);
  } else {
    until = current;
  }
  if (!current.isValid() || !until.isValid()) {
    console.error(`Date format is ${DATE_FORMAT}`);
    exitWithHelp();
  }

  try {
    jobLogger.info('Connecting to server');
    const formDataBody = await getInitialFormData();
    const dbClient = await mongo.connectToDatabase();
    while (current.unix() <= until.unix()) {
      console.log(`Started to fetch data for ${current.format(DATE_FORMAT)}`);
      // eslint-disable-next-line no-await-in-loop
      const isParsed = await parseData(dbClient, formDataBody, current);
      if (!isParsed) {
        console.error(`Failed to parse accident statistics for ${current.format(DATE_FORMAT)}`);
        process.exit(1);
      }

      current = current.add(1, 'day');
    }
    jobLogger.info('Finished');
  } finally {
    jobLogger.end();
    mongo.close();
  }
}

function scheduleParsing() {
  jobLogger.info(`Parse accidents job scheduled to ${ACCIDENTS_STATS_SCHEDULE}`);
  const job = new CronJob(ACCIDENTS_STATS_SCHEDULE, doJob);
  job.start();
}

async function doJob() {
  jobLogger.info('Job is connecting to server');
  const formDataBody = await getInitialFormData();
  const dbClient = await mongo.connectToDatabase();
  const date = dayjs().startOf('day').subtract(1, 'day');
  const isParsed = await parseData(dbClient, formDataBody, date);
  if (!isParsed) {
    if (retried >= ACCIDENTS_STATS_RETRY_MAXIMUM) {
      // todo send email
      jobLogger.error('Data is not available, maximum retries reached. Run this script from command line when data is ready.');
      return;
    }

    retried += 1;
    jobLogger.warn(`Data is not available, scheduling the attempt ${retried}`);
    const nextTime = dayjs().add(ACCIDENTS_STATS_RETRY_MINUTES, 'minute').toDate();
    const job = new CronJob(nextTime, doJob);
    job.start();
  } else {
    retried = 0;
  }
}

function exitWithHelp() {
  console.error('Usage: node jobs/cli_ParseAccidents.js schedule since until\n\n'
    + 'schedule: true to start the scheduler\n'
    + 'since: start date in DD.MM.YYYY format\n'
    + 'until: end date (inclusive) in DD.MM.YYYY format, defaults to since\n');
  process.exit(1);
}

async function getInitialFormData() {
  jobLogger.debug('Initial loading of the bloody form');
  const html = await getPage(ACCIDENTS_STATS_URL);
  const $ = await cheerio.load(html);
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

async function parseData(dbClient, formDataBody, date) {
  jobLogger.debug(`Started to fetch data for ${date.format(DATE_FORMAT)}`);
  formDataBody.ctl00$Application$txtDatum = dayjs(date).format(DATE_FORMAT);
  const formData = new FormData();
  // eslint-disable-next-line no-restricted-syntax
  for (const key in formDataBody) {
    // eslint-disable-next-line no-prototype-builtins
    if (formDataBody.hasOwnProperty(key)) {
      formData.append(key, (formDataBody[key]) ? formDataBody[key] : '');
    }
  }

  const html = await getPage(ACCIDENTS_STATS_URL, formData);
  const $ = await cheerio.load(html);
  jobLogger.debug('Page downloaded');

  const regionsData = $('#celacr tr');
  let result;
  if (regionsData && regionsData.length > 0) {
    result = await saveData(dbClient, regionsData, date, $);
    jobLogger.debug('Data stored in Mongo');
    return result;
  } else {
    return false;
  }
}

async function getPage(url, data) {
  let html = '', promise;
  if (data === undefined) {
    promise = axios.post(url);
  } else {
    promise = axios.post(url, data, { headers: data.getHeaders() });
  }
  await promise
    .then((response) => {
      html = response.data;
    })
    .catch(error => jobLogger.error(error, { label: 'parseAccidents' }));
  return html;
}

async function saveData(dbClient, region, date, $) {
  const storeData = {
    date: date.toDate(),
    regions: [],
    total: {},
  };
  region.each((i, v) => {
    if (i === 0 || i === 1) return;
    const item = { region: undefined, count: 0, impact: {}, reason: {} };
    if (i === region.length - 1) {
      $(v).find('th').each((inx, value) => {
        const val = Number($(value).text().trim());
        if (inx === 1) {
          item[KEYS[inx]] = val;
        } else if ([2, 3, 4, 5].indexOf(inx) > -1) {
          item.impact[KEYS[inx]] = val;
        } else if ([6, 7, 8, 9, 10, 11].indexOf(inx) > -1) {
          item.reason[KEYS[inx]] = val;
        }
      });
      delete item.region;
      storeData.total = item;
    } else {
      $(v).find('td').each((inx, value) => {
        const val = Number($(value).find('span').text());
        if (inx === 0) {
          item[KEYS[inx]] = lookupRegion($(value).text().trim());
        } else if (inx === 1) {
          item[KEYS[inx]] = val;
        } else if ([2, 3, 4, 5].indexOf(inx) > -1) {
          item.impact[KEYS[inx]] = val;
        } else if ([6, 7, 8, 9, 10, 11].indexOf(inx) > -1) {
          item.reason[KEYS[inx]] = val;
        }
      });
      storeData.regions.push(item);
    }
  });

  await dbClient.db().collection('accidents').insertOne(storeData);
  return true;
}

function lookupRegion(vusc) {
  if (vusc.indexOf(REGIONS.JC) >= 0) return 'JC';
  if (vusc.indexOf(REGIONS.JM) >= 0) return 'JM';
  if (vusc.indexOf(REGIONS.KH) >= 0) return 'KH';
  if (vusc.indexOf(REGIONS.KV) >= 0) return 'KV';
  if (vusc.indexOf(REGIONS.LBR) >= 0) return 'LBR';
  if (vusc.indexOf(REGIONS.MS) >= 0) return 'MS';
  if (vusc.indexOf(REGIONS.OLM) >= 0) return 'OLM';
  if (vusc.indexOf(REGIONS.PLS) >= 0) return 'PLS';
  if (vusc.indexOf(REGIONS.PRD) >= 0) return 'PRD';
  if (vusc.indexOf(REGIONS.PRG) >= 0) return 'PRG';
  if (vusc.indexOf(REGIONS.SC) >= 0) return 'SC';
  if (vusc.indexOf(REGIONS.UST) >= 0) return 'UST';
  if (vusc.indexOf(REGIONS.VSC) >= 0) return 'VSC';
  if (vusc.indexOf(REGIONS.ZLN) >= 0) return 'ZLN';
  throw new Error(`Unrecognized region ${vusc}`);
}

exports.doRun = doRun;
