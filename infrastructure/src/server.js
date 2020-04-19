const express = require('express');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const app = express();
app.use(express.json());
app.use(morgan('combined'));
// TODO only use in development
app.use(errorhandler())

function logRequest(req, res, cb) {
    console.log(req);
    // logger.debug(req);
    // logger.debug(res);
    cb();
}
// app.use(logRequest);

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
require('./handlers/polls/getPoll')(app);
require('./handlers/polls/getPolls')(app);
require('./handlers/polls/votePoll')(app);
require('./handlers/polls/getVotes')(app);

module.exports = app;
