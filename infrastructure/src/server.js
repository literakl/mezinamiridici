const express = require('express');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const { createLogger, format, transports } = require('winston');

const app = express();
app.use(express.json());
// TODO only use in development
app.use(errorhandler());

require('./handlers/getStatus')(app);
require('./handlers/users/authorizeUser')(app);
require('./handlers/users/changePassword')(app);
require('./handlers/users/createUser')(app);
require('./handlers/users/forgotPassword')(app);
require('./handlers/users/getUser')(app);
require('./handlers/users/resetPassword')(app);
require('./handlers/users/updateUser')(app);
require('./handlers/users/validateToken')(app);
require('./handlers/users/verifyUser')(app);
require('./handlers/polls/createPoll')(app);
require('./handlers/polls/updatePoll')(app);
require('./handlers/polls/getPoll')(app);
require('./handlers/polls/getPolls')(app);
require('./handlers/polls/votePoll')(app);
require('./handlers/polls/getVotes')(app);
require('./handlers/comments/createComment')(app);
require('./handlers/comments/getComment')(app);
require('./handlers/comments/createCommentVote')(app);

const myFormat = format.printf(info => `${info.message}`);

const logger = createLogger({
  format: myFormat,
  level: 'info',
  transports: [
    new transports.File({
      filename: 'access.log',
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false,
    }),
  ],
  exitOnError: false,
});

logger.stream = {
  write(message) {
    logger.info(message.replace(/\n$/, ''));
  },
};

app.use(morgan('combined', { stream: logger.stream }));

module.exports = app;
