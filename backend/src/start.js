const app = require('./server.js');
const { logger } = require('./utils/logging');

const { NODE_PORT } = process.env || 3000;
app.listen(NODE_PORT, () => logger.info('Server started'));

/*
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  logger.error(p);
  logger.error(reason);
});
*/
