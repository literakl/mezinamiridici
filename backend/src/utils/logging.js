const { stringify } = require('flatted/cjs');
const logger = require('log4js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { NODE_ENV, CONFIG_DIRECTORY, LOG_DIRECTORY } = process.env;

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
};

function appendTimestamp(info) {
  info.timestamp = timestamp();
  return info;
};

let appLogger, mongoLogger, jobLogger;

function configureLoggers(fileName = `${path.join(__dirname, CONFIG_DIRECTORY)}/logger.js`, isJob = false, tag = 'job') {
  const loggerConfig = require(fileName);
  logger.configure(loggerConfig);

  if (isJob) {
    jobLogger = logger.getLogger(tag);
    jobLogger.end = () => logger.shutdown();
    return jobLogger;
  } else {
    if (NODE_ENV === 'test') {
      appLogger = logger.getLogger('test');
    } else if(NODE_ENV === 'development') {
      appLogger = logger.getLogger('development');
    } else {
      appLogger = logger.getLogger('production');
    }
  }  
  mongoLogger = logger.getLogger('mongo');

  // interface for mongoLogger
  // NOTE: overriding mongoLogger.log here causes call-stack overflow due to infinite recursion
  mongoLogger.record = (payload) => {
    let data = Object.assign({}, payload);
    data = appendTimestamp(data);
    const message = mongoCSVFormat(data);

    switch(payload.level) {
      case 'verbose':
      case 5000:
        mongoLogger.verbose(message);
        break;
      case 'debug':
      case 10000:
        mongoLogger.debug(message);
        break;
      case 'info':
      case 20000:
        mongoLogger.info(message);
        break;
      case 'warn':
      case 'warning':
      case 30000:
        mongoLogger.warn(message);
        break;
      case 'error':
      case 40000:
        mongoLogger.error(message);
        break;
      case 'fatal':
      case 50000:
        mongoLogger.fatal(message);
        break;
      default:
        mongoLogger.debug(message);
        break;
    }
  }
  appLogger.end = () => logger.shutdown();
  mongoLogger.end = () => logger.shutdown();

  return appLogger;
}

configureLoggers();

// Create Log directory
fs.mkdir(LOG_DIRECTORY, (err) => {
  if (err.code !== 'EEXIST') {
    return appLogger.error('Could not create the log directory. Error: ', err)
  }
  if (!err) {
    appLogger.info('Log directory created successfully!');
  }
});

exports.logger = appLogger;
exports.mongoLogger = mongoLogger;
exports.jobLogger = jobLogger;
exports.configureLoggers = configureLoggers;
