const fs = require('fs');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

const { STREAM_PICTURES_DIR, STREAM_PICTURES_PATH, STREAM_PICTURES_DEFAULT } = process.env;
const EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

module.exports = (app) => {
  app.options('/v1/items/pictures', auth.cors);

  app.get('/v1/items/pictures', api.diskAPILimits, auth.required, async (req, res) => {
    logger.verbose('get Item Pictures handler starts');
    try {
      if (!STREAM_PICTURES_DIR || !STREAM_PICTURES_PATH || !STREAM_PICTURES_DEFAULT) {
        return api.sendInternalError(res, api.createError('Incomplete configuration', 'sign-in.something-went-wrong'));
      }

      const files = [];

      fs.readdirSync(STREAM_PICTURES_DIR).forEach((file) => {
        if (isPicture(file)) {
          files.push(getItemBody(file, file === STREAM_PICTURES_DEFAULT));
        }
      });

      return api.sendCreated(res, api.createResponse(files));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Internal error', 'sign-in.something-went-wrong'));
    }
  });
};

function isPicture(fileName) {
  const extension = fileName.split('.').pop();
  return EXTENSIONS.indexOf(extension.toLocaleLowerCase()) !== -1;
}

function getItemBody(fileName, isDefault) {
  return {
    path: `${STREAM_PICTURES_PATH}/${fileName}`,
    default_picture: isDefault,
  };
}
