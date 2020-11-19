const express = require('express');
require('path');

const app = express();
app.use('/', express.static(`${__dirname}/dist/`));
app.use(express.json());

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
require('./handlers/users/activateUser')(app);
require('./handlers/users/socialLink')(app);
require('./handlers/users/getUserActivity')(app);
require('./handlers/polls/createPoll')(app);
require('./handlers/polls/updatePoll')(app);
require('./handlers/polls/getPoll')(app);
require('./handlers/polls/getPolls')(app);
require('./handlers/polls/deletePoll')(app);
require('./handlers/polls/votePoll')(app);
require('./handlers/polls/getVotes')(app);
require('./handlers/cms/createContent')(app);
require('./handlers/cms/updateContent')(app);
require('./handlers/cms/getContent')(app);
require('./handlers/cms/deleteContent')(app);
require('./handlers/items/shareItem')(app);
require('./handlers/items/getItems')(app);
require('./handlers/items/tags')(app);
require('./handlers/items/createBlog')(app);
require('./handlers/items/updateBlog')(app);
require('./handlers/items/getBlog')(app);
require('./handlers/items/imageUpload')(app);
require('./handlers/items/getItemPictures')(app);
require('./handlers/misc/tagList')(app);
require('./handlers/comments/createComment')(app);
require('./handlers/comments/getComments')(app);
require('./handlers/comments/voteComment')(app);
require('./handlers/comments/getVotes')(app);

app.all('*', (req, res) => {
  try {
    res.sendFile(`${__dirname}/dist/index.html`);
  } catch (error) {
    res.json({ success: false, message: 'Something went wrong' });
  }
});

module.exports = app;