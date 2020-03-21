const nanoexpress = require('nanoexpress');

const app = nanoexpress();

require('./handlers/getStatus')(app);
require('./handlers/users/getUser')(app);
require('./handlers/users/authorizeUser')(app);

app.setErrorHandler(
    (err, req, res) => {
        console.log("ERROR", err);
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

app.listen(3000, '0.0.0.0')
    .then(r => console.log("Server started"));
