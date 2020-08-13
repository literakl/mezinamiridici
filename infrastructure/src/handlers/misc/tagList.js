
const api = require('../../utils/api.js');
const logger = require('../../utils/logging');
const auth = require('../../utils/authenticate');

require('../../utils/path_env');


module.exports = (app) => {
  
  app.options('/v1/misc/tags', auth.cors);
  
  app.get('/v1/misc/tags', auth.required, auth.cors, async (req, res) => {
    logger.debug('GET TAGS');
    const tagsArray = String(process.env.TAGS).split(",");
    return api.sendResponse(res, api.createResponse(tagsArray));
  });
}