const app = require('./server.js');
const { logger } = require('./utils/logging');

const { NODE_PORT = 3000 } = process.env;
app.listen(NODE_PORT, () => logger.info('Server started'));

process.on('unhandledRejection', (error, promise) => {
  console.log('Unhandled Rejection at: Promise', promise, 'reason:', error);
  logger.error('Unhandled Rejection at:', error.stack || error);
  // Recommended: send the information to sentry.io or whatever crash reporting service you use
});
