const { LOG_DIRECTORY, NUM_LOG_BACKUPS } = process.env;

module.exports = {
  appenders: {
    job: {
      type: 'file',
      filename: `${LOG_DIRECTORY}/parseAccidents.log`,
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
  },
  categories: {
    default: { appenders: ['job', 'console'], level: 'DEBUG' },
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
