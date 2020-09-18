const app = require('./server.js');
const { logger } = require('./utils/logging');

app.listen(3000, () => logger.info('Server started'));

/*
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  logger.error(p);
  logger.error(reason);
});
*/
