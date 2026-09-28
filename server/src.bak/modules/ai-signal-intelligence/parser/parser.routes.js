/**
 * Parser Routes
 *
 * @module signalforge/server/modules/ai-signal-intelligence/parser/routes
 */

import { Router } from 'express';

import { ParserController } from './parser.controller.js';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../../middleware/require-admin.middleware.js';

export function buildParserRouter(controller = null) {
  const router = Router();
  const parserController = controller || new ParserController();

  router.use(authenticationMiddleware());

  router.post('/parse', parserController.parse);
  router.get('/parses/:parseId', parserController.getParse);
  router.get('/messages/:messageId/parses', parserController.listByMessage);
  router.get('/parses', requireAdminMiddleware(), parserController.list);

  return router;
}

export default buildParserRouter;