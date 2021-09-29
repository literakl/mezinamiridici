const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');

const { logger } = require('../../utils/logging');
const mongo = require('../../utils/mongo.js');
const auth = require('../../utils/authenticate');
const api = require('../../utils/api.js');
require('../../utils/path_env');

const { UPLOAD_PICTURES_DIR, UPLOADED_PICTURES_PATH, UPLOAD_DELAY_MS } = process.env;

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const ms = dayjs();
    const dir = `${UPLOAD_PICTURES_DIR}/${ms % 100}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename(req, file, cb) {
    const name = `${Date.now()}${path.extname(file.originalname)}`;
    cb(null, name);
  },
});

const uploader = multer({ storage });

module.exports = (app) => {
  app.use(bodyParser.json());

  app.options('/v1/images', auth.cors);

  // there is a problem with local vue-cli, because it detects changes in its folder and automatically redeploys the app
  app.post('/v1/images', api.diskAPILimits, auth.required, auth.cors, uploader.single('image'), async (req, res) => {
    logger.debug('image upload handler starts');

    try {
      const { file } = req; // TODO is it safe? What if user on slow network is sending large file and connection is interrupted?
      if (!file) {
        return api.sendBadRequest(res, api.createError('Missing image'));
      }

      const user = auth.getIdentity(req.identity);
      const pictureId = mongo.generateTimeId();
      const destination = `${UPLOADED_PICTURES_PATH}${file.destination.substring(UPLOAD_PICTURES_DIR.length)}/${file.filename}`;

      const upload = {
        _id: pictureId,
        user: user.userId,
        date: new Date(),
        mime: file.mimetype,
        path: destination,
      };

      const dbClient = await mongo.connectToDatabase();
      await mongo.insertOne(dbClient, 'uploads', upload);

      const body = {
        pictureId,
        url: destination,
      };

      setTimeout(() => api.sendCreated(res, api.createResponse(body)), UPLOAD_DELAY_MS);
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to upload image', 'sign-in.something-went-wrong'));
    }
  });

  app.options('/v1/images/:pictureId', auth.cors);

  app.patch('/v1/images/:pictureId', auth.required, auth.cors, async (req, res) => {
    logger.debug('patch image handler starts');

    try {
      const { pictureId } = req.params;
      if (!pictureId) {
        return api.sendMissingParam(res, 'pictureId');
      }
      const { itemId } = req.body;
      if (!itemId) {
        return api.sendMissingParam(res, 'itemId');
      }

      const user = auth.getIdentity(req.identity);
      const filter = {
        _id: pictureId,
        user: user.userId,
      };
      const setters = { itemId };
      const update = { $set: setters };

      const dbClient = await mongo.connectToDatabase();
      const result = await mongo.updateOne(dbClient, 'uploads', filter, update);

      if (result.matchedCount === 1) {
        return api.sendResponse(res, api.createResponse('OK'));
      } else {
        return api.sendNotFound(res, api.createResponse('Picture not found or user not authorized to modify'));
      }
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to update image', 'sign-in.something-went-wrong'));
    }
  });
};
