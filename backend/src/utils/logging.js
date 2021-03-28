const { stringify } = require('flatted/cjs');
const { createLogger, format, transports } = require('winston');

const { NODE_ENV } = process.env;

const { combine, printf } = format;

const myFormat = printf((info) => {
  let output = info.timestamp;
  if (info.label) output += ` [${info.label}] `;
  output += `[${info.level}]: `;
  output += (info.message === Object(info.message)) ? stringify(info.message) : info.message;
  return output;
});

const mongoCSVFormat = printf((info) => {
  let output = `${info.timestamp},${info.time},${info.operation},${info.result},${(info.collection) ? info.collection : ''},`;
  if (info.message) {
    output += (info.message === Object(info.message)) ? stringify(info.message) : info.message;
  }
  return output;
});

function fullTimestamp() {
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

function shortTimestamp() {
  const currentDate = new Date();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();
  let ms = currentDate.getMilliseconds();
  if (ms < 10) {
    ms = `00${ms}`;
  } else if (ms < 100) {
    ms = `0${ms}`;
  }
  return `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}:${ms}`;
}

const appendFullTimestamp = format((info) => {
  info.timestamp = fullTimestamp();
  return info;
});

const appendShortTimestamp = format((info) => {
  info.timestamp = shortTimestamp();
  return info;
});

let appLogger;

// TODO externalize winston logger configuration
const mongoLogger = createLogger({
  format: combine(appendFullTimestamp(), mongoCSVFormat),
  transports: [
    new transports.File({ filename: 'mongo.csv' }),
  ],
  exitOnError: false,
});

const jobLogger = createLogger({
  format: combine(appendFullTimestamp(), myFormat),
  transports: [
    new transports.File({ filename: 'jobs.log', level: 'debug' }),
  ],
  exitOnError: false,
});

if (NODE_ENV === 'test') {
  appLogger = createLogger({
    level: 'debug',
    format: combine(appendFullTimestamp(), myFormat),
    transports: [
      new transports.File({ filename: 'test.log' }),
    ],
  });
} else {
  appLogger = createLogger({
    level: 'debug',
    format: combine(appendFullTimestamp(), myFormat),
    // defaultMeta: { service: 'user-service' },
    transports: [
      new transports.File({ filename: 'application.log' }),
      new transports.File({
        filename: 'error.log', level: 'warn', handleExceptions: true, exitOnError: false,
      }),
    ],
    exitOnError: false,
  });

  if (NODE_ENV === 'development') {
    appLogger.add(new transports.Console({
      format: combine(appendShortTimestamp(), myFormat),
      exitOnError: false,
    }));
  }
}

exports.logger = appLogger;
exports.jobLogger = jobLogger;
exports.mongoLogger = mongoLogger;
