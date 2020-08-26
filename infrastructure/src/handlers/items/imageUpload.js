const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const logger = require('../../utils/logging');
const auth = require('../../utils/authenticate');
const api = require('../../utils/api.js');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = './src/dist/uploads'; // todo env
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename(req, file, cb) {
    // todo shall we sanitize file names?
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

module.exports = (app) => {
  app.use(bodyParser.json());

  app.options('/v1/uploadImage', auth.cors);

  app.put('/v1/uploadImage', auth.cors, upload.single('image'), async (req, res) => {
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
