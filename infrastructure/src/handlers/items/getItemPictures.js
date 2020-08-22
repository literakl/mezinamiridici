const fs = require('fs');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

const IMAGES_DIR = process.env.STREAM_PICTURES_DIR;
const WEB_PATH = process.env.STREAM_PICTURES_PATH;
const DEFAULT_IMAGE = process.env.STREAM_PICTURES_DEFAULT;
const EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

module.exports = (app) => {
  app.options('/v1/items/pictures', auth.cors);

  app.get('/v1/items/pictures', auth.required, async (req, res) => {
    logger.verbose('get Item Pictures handler starts');
    try {
      if (!IMAGES_DIR || !WEB_PATH || !DEFAULT_IMAGE) {
        return api.sendInternalError(res, api.createError('Incomplete configuration', 'sign-in.something-went-wrong'));
      }

      const files = [];

      fs.readdirSync(IMAGES_DIR).forEach((file) => {
        if (isPicture(file)) {
          files.push(getItemBody(file, file === DEFAULT_IMAGE));
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
    path: `${WEB_PATH}/${fileName}`,
    default_picture: isDefault,
  };
}
