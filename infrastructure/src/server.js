const nanoexpress = require('nanoexpress');
const app = nanoexpress();

const logger = require("./utils/logging");

function logRequest(req, res, cb) {
    logger.debug(req);
    logger.debug(res);
    cb();
}
app.use(logRequest);

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

app.setErrorHandler(
    (err, req, res) => {
        logger.error("ERROR", err);
        return res.send({
            status: 'error',
            status_code: 500,
            message: 'oops'
        })
    }
);

app.setNotFoundHandler((res, req) => {
    return res.send({ code: 404, message: 'You entered wrong url' });
});

module.exports = app;
