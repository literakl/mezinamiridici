// const util = require('util');
const { stringify } = require('flatted/cjs');
const { createLogger, format, transports } = require('winston');

const { combine, printf } = format;

const myFormat = printf(info => `${info.timestamp} [${info.level}]: ${info.message === Object(info.message) ? stringify(info.message) : info.message}`);

function myTimestamp() {
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
const appendTimestamp = format((info, opts) => {
  info.timestamp = myTimestamp();
  return info;
});

let logger;

if (process.env.NODE_ENV === 'test') {
  logger = createLogger({
    level: 'debug',
    format: combine(
      appendTimestamp(),
      myFormat,
    ),
    transports: [
      new transports.File({ filename: 'test.log' }),
    ],
  });
} else {
  logger = createLogger({
    level: 'debug',
    format: combine(
      appendTimestamp(),
      myFormat,
    ),
    // defaultMeta: { service: 'user-service' },
    transports: [
      new transports.File({ filename: 'application.log' }),
      new transports.File({
        filename: 'error.log', level: 'warn', handleExceptions: true, exitOnError: false,
      }),
    ],
  });

  if (process.env.NODE_ENV !== 'production') { // todo check condition
    logger.add(new transports.Console({
      format: format.simple(),
    }));
  }
}

logger.on('finish', (info) => {
  // All `info` log messages has now been logged
});

module.exports = logger;
