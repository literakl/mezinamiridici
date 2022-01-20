const { LOG_DIRECTORY, NUM_LOG_BACKUPS } = process.env;

module.exports = {
  pm2: true,
  appenders: {
    application: {
      type: 'dateFile',
      filename: `${LOG_DIRECTORY}/application.log`,
      keepFileExt: true,
      pattern: 'yyyy-MM-dd',
      compress: true,
      backups: NUM_LOG_BACKUPS,
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} [%p] %m',
      },
    },
    test: {
      type: 'file',
      filename: `${LOG_DIRECTORY}/test.log`,
      maxLogSize: 102400,
      keepFileExt: true,
      compress: true,
      backups: NUM_LOG_BACKUPS,
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} [%p] [%c]: %m',
      },
    },
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%d{hh:mm:ss.SSS} [%p] [%c]: %m',
      },
    },
    errorFile: {
      type: 'dateFile',
      filename: `${LOG_DIRECTORY}/error.log`,
      keepFileExt: true,
      pattern: 'yyyy-MM-dd',
      compress: true,
      backups: NUM_LOG_BACKUPS,
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} [%p] [%f{1}:%l]: %m',
      },
    },
    error: {
      type: 'logLevelFilter',
      level: 'WARN',
      appender: 'errorFile',
    },
  },
  categories: {
    default: { appenders: ['application', 'error'], level: 'DEBUG' },
    test: { appenders: ['test'], level: 'DEBUG' },
    production: { appenders: ['application', 'error'], level: 'INFO', enableCallStack: true },
    development: { appenders: ['application', 'error'], level: 'DEBUG', enableCallStack: true },
  },
  levels: {
    verbose: {
      value: 5000,
      colour: 'blue',
    },
    warning: {
      value: 30000,
      colour: 'yellow',
    },
  },
};
