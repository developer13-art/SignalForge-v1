'use strict';

const express = require('express');

const blinkController = require('./blink.controller');
const actionsMiddleware = require('../actions.middleware');

/**
 * SignalForge - Blink Routes
 *
 * Internal (authenticated) routes for managing Blinks, shares, and
 * analytics. Public Solana Actions endpoints are mounted separately in
 * the parent `actions.routes.js` file so that their CORS and rate
 * limiting behavior is isolated from authenticated traffic.
 */

const router = express.Router();

const readLimiter = actionsMiddleware.createRateLimiter({
  windowMs: 60000,
  max: 240,
});

const writeLimiter = actionsMiddleware.createRateLimiter({
  windowMs: 60000,
  max: 60,
});

function requireAuthentication(req, res, next) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      message: 'Authentication is required',
      error: { code: 'UNAUTHENTICATED' },
    });
  }
  return next();
}

router.use(actionsMiddleware.requestIdMiddleware);

router.get('/analytics/me', requireAuthentication, readLimiter, blinkController.getOwnerAnalytics);

router.get('/templates', requireAuthentication, readLimiter, blinkController.listTemplates);
router.post('/templates', requireAuthentication, writeLimiter, blinkController.createTemplate);
router.get('/templates/:templateId', requireAuthentication, readLimiter, blinkController.getTemplate);
router.patch('/templates/:templateId', requireAuthentication, writeLimiter, blinkController.updateTemplate);
router.delete('/templates/:templateId', requireAuthentication, writeLimiter, blinkController.deleteTemplate);

router.get('/', requireAuthentication, readLimiter, blinkController.list);
router.post('/', requireAuthentication, writeLimiter, blinkController.create);

router.get('/:blinkId', requireAuthentication, readLimiter, blinkController.getById);
router.patch('/:blinkId', requireAuthentication, writeLimiter, blinkController.update);

router.post('/:blinkId/pause', requireAuthentication, writeLimiter, blinkController.pause);
router.post('/:blinkId/resume', requireAuthentication, writeLimiter, blinkController.resume);
router.post('/:blinkId/archive', requireAuthentication, writeLimiter, blinkController.archive);

router.post('/:blinkId/share', requireAuthentication, writeLimiter, blinkController.recordShare);
router.get('/:blinkId/shares', requireAuthentication, readLimiter, blinkController.listShares);
router.post('/:blinkId/share-links', requireAuthentication, readLimiter, blinkController.buildShareLinks);

router.get('/:blinkId/analytics', requireAuthentication, readLimiter, blinkController.getAnalytics);
router.get('/:blinkId/funnel', requireAuthentication, readLimiter, blinkController.getFunnel);
router.get('/:blinkId/top-conversions', requireAuthentication, readLimiter, blinkController.getTopConversions);

router.use(actionsMiddleware.errorHandlerMiddleware);

module.exports = router;