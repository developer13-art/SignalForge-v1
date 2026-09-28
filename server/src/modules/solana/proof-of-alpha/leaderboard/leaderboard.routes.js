'use strict';

const express = require('express');

const leaderboardController = require('./leaderboard.controller');
const actionsMiddleware = require('../../actions/actions.middleware');

/**
 * SignalForge - Leaderboard Routes
 *
 * Public reads are intentionally unauthenticated so that the on-chain
 * leaderboard can be embedded on marketing pages and in the provider
 * marketplace. Refresh and cache-clear endpoints require authentication.
 */

const router = express.Router();

const readLimiter = actionsMiddleware.createRateLimiter({
  windowMs: 60000,
  max: 240,
});

const writeLimiter = actionsMiddleware.createRateLimiter({
  windowMs: 60000,
  max: 30,
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

function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      message: 'Administrator access is required',
      error: { code: 'FORBIDDEN' },
    });
  }
  return next();
}

router.use(actionsMiddleware.requestIdMiddleware);

router.get('/', readLimiter, leaderboardController.getLeaderboard);
router.get('/top', readLimiter, leaderboardController.getTopProviders);
router.get('/summary', readLimiter, leaderboardController.getSummary);
router.get('/filters', readLimiter, leaderboardController.listFilters);

router.get(
  '/providers/:providerId',
  readLimiter,
  leaderboardController.getLeaderboardEntry,
);
router.get(
  '/providers/:providerId/verification',
  readLimiter,
  leaderboardController.getProviderVerification,
);
router.get(
  '/providers/:providerId/badge',
  readLimiter,
  leaderboardController.getProviderBadge,
);

router.post(
  '/refresh',
  requireAuthentication,
  writeLimiter,
  leaderboardController.refreshLeaderboard,
);
router.post('/refresh-all', requireAdmin, writeLimiter, leaderboardController.refreshAll);
router.post('/clear-cache', requireAdmin, writeLimiter, leaderboardController.clearCache);

router.use(actionsMiddleware.errorHandlerMiddleware);

module.exports = router;