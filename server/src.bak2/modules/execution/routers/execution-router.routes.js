'use strict';

const express = require('express');

const controller = require('./execution-router.controller');
const { toRouterResponse, isExecutionRouterError } = require('./execution-router.errors');

/**
 * SignalForge - Execution Router Routes
 *
 * The execution router exposes resolve, simulate, explain, and policy
 * endpoints under `/execution/router`. Read endpoints are open to any
 * authenticated user; policy write endpoints are authenticated.
 */

const router = express.Router();

const buckets = new Map();

function rateLimit({ windowMs = 60000, max = 240 } = {}) {
  return function limiter(req, res, next) {
    const key = req.ip || 'unknown';
    const now = Date.now();
    let entry = buckets.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      buckets.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({
        message: 'Too many requests',
        error: { code: 'RATE_LIMITED' },
      });
    }
    return next();
  };
}

const readLimiter = rateLimit({ windowMs: 60000, max: 240 });
const writeLimiter = rateLimit({ windowMs: 60000, max: 60 });

function requireAuthentication(req, res, next) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      message: 'Authentication is required',
      error: { code: 'UNAUTHENTICATED' },
    });
  }
  return next();
}

router.use(requireAuthentication);

router.post('/resolve', writeLimiter, controller.resolveRoute);
router.post('/simulate', writeLimiter, controller.simulateRoute);
router.post('/explain', writeLimiter, controller.explainRoute);
router.get('/gateways', readLimiter, controller.listSupportedGateways);
router.get('/metrics', readLimiter, controller.getMetrics);

router.get('/policies', readLimiter, controller.listPolicies);
router.get('/policies/default', readLimiter, controller.getPolicy);
router.post('/policies', writeLimiter, controller.savePolicy);
router.post('/policies/:policyId/default', writeLimiter, controller.setDefaultPolicy);
router.delete('/policies/:policyId', writeLimiter, controller.deletePolicy);

router.get('/routes', readLimiter, controller.listRoutes);
router.get('/routes/:routeId', readLimiter, controller.getRoute);
router.get('/routes/:routeId/logs', readLimiter, controller.listRouteLogs);
router.get('/usage', readLimiter, controller.getUsage);

router.use((error, _req, res, _next) => {
  if (isExecutionRouterError(error)) {
    const { statusCode, body } = toRouterResponse(error);
    return res.status(statusCode).json(body);
  }
  return res.status(500).json({
    message: 'An unexpected error occurred in the execution router',
    error: { code: 'EXECUTION_ROUTER_INTERNAL_ERROR' },
  });
});

module.exports = router;