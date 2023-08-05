const { LOG_DIRECTORY, NUM_LOG_BACKUPS } = process.env;

module.exports = {
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
  },
  categories: {
    default: { appenders: ['application'], level: 'debug' },
    test: { appenders: ['test'], level: 'debug' },
    production: { appenders: ['application'], level: 'info', enableCallStack: true },
    development: { appenders: ['application'], level: 'trace', enableCallStack: false },
  },
};
