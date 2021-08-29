const { default: axios } = require('axios');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/twitter-html', auth.cors);

  app.get('/v1/twitter-html', auth.cors, async (req, res) => {
    logger.debug('twitter-html handler starts');
    const { url } = req.query;
    if (!url) {
      return api.sendMissingParam(res, 'url');
    }
    try {
      const endpoint = 'https://publish.twitter.com/oembed?url=' + url;
      const apiResponse = await axios.get(endpoint)
      return api.sendResponse(res, api.createResponse(apiResponse.data));
    } catch (err) {
      logger.debug('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to get comment votes', 'sign-in.something-went-wrong'));
    }
  });
};
