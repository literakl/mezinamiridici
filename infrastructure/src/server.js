const nanoexpress = require('nanoexpress');

const app = nanoexpress();

require('./handlers/getStatus')(app);
require('./handlers/users/authorizeUser')(app);

app.listen(3000, '0.0.0.0')
    .then(r => console.log("Server started"));
