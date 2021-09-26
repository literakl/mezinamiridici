const auth = require('../../utils/authenticate');
const { logger } = require('../../utils/logging');

module.exports = (app) => {
  app.options('/v1/posts/:blogId/snippets', auth.cors);

  app.get('/v1/posts/:blogId/snippets', auth.required, auth.staffer, auth.cors, async (/* req, res */) => {
    logger.debug('get snippets handler starts');
  });

  app.post('/v1/posts/:blogId/snippets', auth.required, auth.editor_in_chief, auth.cors, async (/* req, res */) => {
    logger.debug('create snippet handler starts');
  });

  app.patch('/v1/posts/:blogId/snippets/:code', auth.required, auth.editor_in_chief, auth.cors, async (/* req, res */) => {
    logger.debug('update snippet handler starts');
  });

  app.delete('/v1/posts/:blogId/snippets/:code', auth.required, auth.editor_in_chief, auth.cors, async (/* req, res */) => {
    logger.debug('delete snippet handler starts');
  });
};
