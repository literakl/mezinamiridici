const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const sanitize = require('sanitize-filename');

const { logger } = require('../../utils/logging');
const auth = require('../../utils/authenticate');
const api = require('../../utils/api.js');
require('../../utils/path_env');

const { BLOG_PICTURES_UPLOAD_DIR } = process.env;

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = BLOG_PICTURES_UPLOAD_DIR; // todo make it more dynamic
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename(req, file, cb) {
    const sanitizedFilename = sanitize(file.originalname);
    cb(null, `${path.basename(sanitizedFilename).split('.')[0]}-${Date.now()}${path.extname(sanitizedFilename)}`);
  },
});

const upload = multer({ storage });

module.exports = (app) => {
  app.use(bodyParser.json());

  app.options('/v1/uploadImage', auth.cors);

  app.post('/v1/uploadImage', api.diskAPILimits, auth.cors, upload.single('image'), async (req, res) => {
    logger.verbose('image upload handler starts');

    try {
      const host = `${req.connection.encrypted ? 'https' : 'http'}://${req.headers.host}`;
      const body = {
        url: `${host}/uploads/${req.file.filename}`, // todo shall we sanitize file names?
      };
      return api.sendCreated(res, api.createResponse(body));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to upload image', 'sign-in.something-went-wrong'));
    }
  });
};
