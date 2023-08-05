const api = require('../../utils/api.js');
const { log } = require('../../utils/logging');

module.exports = (app) => {
  app.get('/v1/status', (req, res) => {
    log.debug('getStatus handler starts');
    const response = {
      api: '1.0',
      status: 'OK',
    };
    return api.sendResponse(res, api.createResponse(response));
  });
};
