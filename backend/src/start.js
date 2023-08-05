const app = require('./server.js');
const { log } = require('./utils/logging');
const { NODE_PORT = 3000 } = process.env;

app.listen(NODE_PORT, () => log.info('Server started'));

process.on('unhandledRejection', (error, promise) => {
  console.log('Unhandled Rejection at: Promise', promise, 'reason:', error);
  log.error('Unhandled Rejection at:', error.stack || error);
  // Recommended: send the information to sentry.io or whatever crash reporting service you use
});
