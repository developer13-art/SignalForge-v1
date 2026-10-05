'use strict';

/**
 * Crypto Trading Routes
 *
 * Mounts the crypto trading controller under /crypto-trading. All
 * endpoints require authentication; the controller enforces per-user
 * access and delegates to the service layer.
 *
 * @module signalforge/server/routes/crypto-trading
 */

const express = require('express');

const controller = require('../modules/crypto-trading/crypto-trading.controller');
const executionRouterController = require('../modules/execution/routers/execution-router.controller');
const { authenticationMiddleware } = require('../middleware/authentication.middleware');

const router = express.Router();

router.use(authenticationMiddleware());

router.get('/positions', controller.listPositions);
router.get('/positions/:positionId', controller.getPosition);
router.post('/positions/:positionId/close', controller.closePosition);

router.get('/orders', controller.listOrders);
router.get('/orders/:orderId', controller.getOrder);
router.post('/orders/:orderId/cancel', controller.cancelOrder);

router.get('/history', controller.listHistory);
router.get('/swaps', controller.listSwaps);

router.post('/swap/quote', controller.quoteSwap);
router.post('/swap/build', controller.buildSwap);
router.post('/swap/submit', controller.submitSwap);
router.post('/swap/confirm', controller.confirmSwap);

router.get('/wallet', controller.getTradingWallet);
router.post('/wallet', controller.registerTradingWallet);
router.delete('/wallet', controller.unregisterTradingWallet);

router.get('/risk', controller.getRiskSettings);
router.put('/risk', controller.updateRiskSettings);

router.get('/automation', controller.getAutomation);
router.put('/automation', controller.updateAutomation);

// Route preview inside the crypto trading namespace.
router.post('/route/simulate', executionRouterController.simulateRoute);
router.post('/route/explain', executionRouterController.explainRoute);
router.get('/route/gateways', executionRouterController.listSupportedGateways);

module.exports = router;