/**
 * Execution Routes
 *
 * @module signalforge/server/modules/execution/routes
 */

import { Router } from 'express';

import { ExecutionController } from './execution.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../middleware/require-admin.middleware.js';

export function buildExecutionRouter(controller = null) {
  const router = Router();
  const executionController = controller || new ExecutionController();

  router.use(authenticationMiddleware());

  router.post('/open-position', executionController.openPosition);
  router.post('/close-position', executionController.closePosition);
  router.post('/modify-position', executionController.modifyPosition);
  router.post('/partial-close', executionController.partialClose);

  router.post('/pending-order', executionController.placePendingOrder);
  router.post('/pending-order/cancel', executionController.cancelPendingOrder);

  router.post('/sync', executionController.syncPositions);

  router.get('/requests', executionController.listRequests);
  router.get('/requests/:requestId', executionController.getRequest);
  router.get('/trades/:tradeId/requests', executionController.listRequestsByTrade);
  router.post('/requests/:requestId/retry', requireAdminMiddleware(), executionController.retryDeadLetter);

  router.get('/logs', requireAdminMiddleware(), executionController.listLogs);
  router.get('/logs/latency', requireAdminMiddleware(), executionController.latencyStats);
  router.get('/logs/symbols', requireAdminMiddleware(), executionController.symbolBreakdown);

  router.get('/gateways', executionController.listGateways);
  router.get('/gateways/:gateway/status', executionController.checkGateway);

  return router;
}

export default buildExecutionRouter;