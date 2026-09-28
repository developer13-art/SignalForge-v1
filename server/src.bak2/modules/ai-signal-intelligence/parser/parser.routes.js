/**
 * Parser Routes
 *
 * @module signalforge/server/modules/ai-signal-intelligence/parser/routes
 */
const { Router } = require('express');
const { ParserController } = require('./parser.controller.js');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware.js');
const { requireAdminMiddleware } = require('../../../middleware/require-admin.middleware.js');
function buildParserRouter(controller = null) {
  const router = Router();
  const parserController = controller || new ParserController();

  router.use(authenticationMiddleware());

  router.post('/parse', parserController.parse);
  router.get('/parses/:parseId', parserController.getParse);
  router.get('/messages/:messageId/parses', parserController.listByMessage);
  router.get('/parses', requireAdminMiddleware(), parserController.list);

  return router;
}
module.exports = buildParserRouter;
module.exports.buildParserRouter = buildParserRouter;
