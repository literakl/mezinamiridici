const app = require('./server.js');
const logger = require('./utils/logging');

app.listen(3000, () => logger.info('Server started'));
