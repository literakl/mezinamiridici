const api = require('../../utils/api.js');
const logger = require('../../utils/logging');
const auth = require('../../utils/authenticate');
const mongo = require('../../utils/mongo.js');

require('../../utils/path_env');

module.exports = (app) => {
  app.options('/v1/misc/tags', auth.cors);

  app.get('/v1/misc/tags', auth.required, auth.cors, async (req, res) => {
    logger.debug('GET TAGS');

    try {
      const dbClient = await mongo.connectToDatabase();
      logger.debug('Mongo connected');

      const tagsWeight = await getTagWeight(dbClient);
      logger.debug('get tags weight');

      const tagsArray = String(process.env.TAGS).split(',');
      tagsArray.forEach((item, index) => {
        tagsArray[index] = [item, tagsWeight[item]];
      });

      return api.sendResponse(res, api.createResponse(tagsArray));
    } catch (err) {
      logger.error('Request failed', err);
      return api.sendInternalError(res, api.createError('Failed to create post', 'sign-in.something-went-wrong'));
    }
  });
};

const getTagWeight = async (dbClient) => {
  let arr = {};
  const items = await dbClient.db().collection('items').find({ }).toArray();
  items.forEach((item) => {
    const itemTags = item.info.tags;
    
    itemTags.forEach((i) => {
      if(!arr[i]) arr[i] = 0;
      arr[i] += 1;
    });
  });
  return arr;
}