
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './src/dist/uploads';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });
const path = require('path');

module.exports = (app) => {
  app.use(bodyParser.json());
  app.options('/v1/uploadImage', auth.cors);

  app.put('/v1/uploadImage', auth.cors, upload.single('image'), async (req, res) => {
    logger.verbose('image upload handler starts');
      
    try {
      const body = {
        url: `http://127.0.0.1:3000/uploads/${req.file.filename}`
      }
      return api.sendCreated(res, api.createResponse(body));

    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to upload image', 'sign-in.something-went-wrong'));
    }
  });

};

