const { stringify } = require('flatted/cjs');
const logger = require('log4js');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // TODO check path_env.js

const { NODE_ENV } = process.env;
let { CONFIG_DIRECTORY, LOG_DIRECTORY } = process.env;
if (!CONFIG_DIRECTORY) {
  CONFIG_DIRECTORY = '../../config';
}
if (!LOG_DIRECTORY) {
  LOG_DIRECTORY = './logs';
}

// print to console the current setting
console.log(`NODE_ENV = ${NODE_ENV}`);
console.log(`CONFIG_DIRECTORY = ${CONFIG_DIRECTORY}`);
console.log(`LOG_DIRECTORY = ${LOG_DIRECTORY}`);

// Create Log directory
fs.mkdir(LOG_DIRECTORY, (err) => {
  if (!err) {
    appLogger.info('Log directory created successfully!');
    appLogger.error('Could not create the log directory. Error: ', err);
  }
});

let appLogger, jobLogger;

function timestamp() {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();
  let ms = currentDate.getMilliseconds();
  if (ms < 10) {
    ms = `00${ms}`;
  } else if (ms < 100) {
    ms = `0${ms}`;
  }
  return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day} ${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}:${ms}`;
}

function mongoCSVFormat(info) {
  let output = `${info.timestamp},${info.time},${info.operation},${info.result},${(info.collection) ? info.collection : ''},`;
  if (info.message) {
    output += (info.message === Object(info.message)) ? stringify(info.message) : info.message;
  }
  return output;
}

function appendTimestamp(info) {
  info.timestamp = timestamp();
  return info;
}

function configureLoggers(fileName = 'logger.js', isJob = false, tag = 'job') {
  const configPath = path.resolve(CONFIG_DIRECTORY, fileName);
  // eslint-disable-next-line import/no-dynamic-require,global-require
  const loggerConfig = require(configPath);
  logger.configure(loggerConfig);

  if (isJob) {
    jobLogger = logger.getLogger(tag);
    jobLogger.end = () => logger.shutdown();
    return jobLogger;
  } else if (NODE_ENV === 'test') {
    appLogger = logger.getLogger('test');
  } else if (NODE_ENV === 'development') {
    appLogger = logger.getLogger('development');
  } else {
    appLogger = logger.getLogger('production');
  }

  appLogger.end = () => logger.shutdown();
  return appLogger;
}

configureLoggers();

exports.logger = appLogger;
exports.jobLogger = jobLogger;
exports.configureLoggers = configureLoggers;
