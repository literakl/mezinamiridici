const logger= require('log4js');
const fs= require('fs');
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

function configureLoggers(fileName = 'logger.js', isJob = false, tag = 'job') {
  const configPath = path.resolve(CONFIG_DIRECTORY, fileName);
  // eslint-disable-next-line import/no-dynamic-require,global-require
  const loggerConfig = require(configPath);
  logger.configure(loggerConfig);

  if (isJob) {
    jobLogger = logger.getLogger(tag);
    jobLogger.end = () => logger.shutdown();
    return;
  }

  if (NODE_ENV === 'test') {
    appLogger = logger.getLogger('test');
  } else if (NODE_ENV === 'development') {
    appLogger = logger.getLogger('development');
  } else {
    appLogger = logger.getLogger('production');
  }

  appLogger.end = () => logger.shutdown();
  appLogger.info('Logger set up');
}

configureLoggers();

exports.log = appLogger;
exports.jobLogger = jobLogger;
exports.configureLoggers = configureLoggers;
