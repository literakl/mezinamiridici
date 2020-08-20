const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');
const fs = require('fs');

const imagePath = process.env.STREAM_PICTURES_DIR;
const returnUrl = process.env.STREAM_PICTURES_PATH;
const defaultFileName = process.env.STREAM_PICTURES_DEFAULT;
const thumbPrefix = 'thumb';

module.exports = (app) => {
  app.options('/v1/items/pictures', auth.cors);

  app.get('/v1/items/pictures', auth.required, async (req, res) => {
    logger.verbose('get Item Pictures handler starts');
    try {

      if( !imagePath || !returnUrl || !defaultFileName ) throw 'Missed environment variable.';

      const fileNameList = [];
      const returnList = [];

      fs.readdirSync(imagePath).forEach(file => {
        if(checkExtension(file)) fileNameList.push(file);
      });

      if(!isExistFile(defaultFileName, fileNameList)) throw 'there no default file';
      if(!isExistThumb(defaultFileName, fileNameList)) throw 'there no thumbnail of default file.';

      fileNameList.forEach((item) => {
        if(!isThumbName(item, fileNameList) && isExistThumb(item, fileNameList)) returnList.push(getItemBody(item, item === defaultFileName));
      });

      logger.info('get Item Pictures handler end');
      return api.sendCreated(res, api.createResponse(returnList));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError(err, 'sign-in.something-went-wrong'));
    }
  });

  
};

const checkExtension = (fileName) => {
  const extensionList = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const extension = fileName.split('.').pop();
  if(extensionList.indexOf(extension.toLocaleLowerCase()) === -1) return false;
  return true;
}

const getItemBody = (fileName, isDefault) => {
  return {
    thumbnail: `${returnUrl}/${thumbPrefix}_${fileName}`,
    path: `${returnUrl}/${fileName}`,
    default_picture: isDefault,
  }
}

const isThumbName = (fileName) => {
  return thumbPrefix === fileName.split('_').shift();
}
const isExistFile = (fileName, list) => {
  return list.indexOf(fileName) > -1;
}
const isExistThumb = (fileName, list) => {
  return list.indexOf(`${thumbPrefix}_${fileName}`) > -1;
}
