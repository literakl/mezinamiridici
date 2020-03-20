const api = require('../utils/api.js');

module.exports = app => {
    app.get('/v1/status', (req, res) => {
        console.log("getStatus handler starts");
        const response = {
            api: '1.0',
            status: 'OK'
        };
        return api.sendRresponse(res, api.createResponse(response));
    });
};
