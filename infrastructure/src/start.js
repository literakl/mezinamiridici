const app = require('./server.js');
const logger = require("./utils/logging");

app.listen(3000, '0.0.0.0')
    .then(r => logger.info("Server started"));
