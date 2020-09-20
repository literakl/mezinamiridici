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

let appLogger, jobLogger;

if (NODE_ENV === 'test') {
  appLogger = createLogger({
    level: 'debug',
    format: combine(appendFullTimestamp(), myFormat),
    transports: [
      new transports.File({ filename: 'test.log' }),
    ],
  });

  jobLogger = appLogger;
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
  });

  if (NODE_ENV !== 'production') { // todo check condition
    appLogger.add(new transports.Console({
      format: combine(appendShortTimestamp(), myFormat),
    }));
  }

  jobLogger = createLogger({
    format: combine(appendFullTimestamp(), myFormat),
    transports: [
      new transports.File({ filename: 'jobs.log', level: 'debug' }),
    ],
  });
}

exports.logger = appLogger;
exports.jobLogger = jobLogger;
