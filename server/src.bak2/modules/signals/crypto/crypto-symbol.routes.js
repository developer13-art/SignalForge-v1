'use strict';

const express = require('express');

const controller = require('./crypto-symbol.controller');
const { toCryptoResponse, isCryptoError } = require('./crypto.errors');

const router = express.Router();

const rateLimits = new Map();

function rateLimit({ windowMs = 60000, max = 240 } = {}) {
  return function limiter(req, res, next) {
    const key = req.ip || 'unknown';
    const now = Date.now();
    let entry = rateLimits.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      rateLimits.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({
        message: 'Too many requests',
        error: { code: 'CRYPTO_SERVICE_UNAVAILABLE' },
      });
    }

    return next();
  };
}

const readLimiter = rateLimit({ windowMs: 60000, max: 240 });
const writeLimiter = rateLimit({ windowMs: 60000, max: 60 });

router.use((req, _res, next) => {
  req.cryptoRequestId = req.headers['x-request-id'] || null;
  next();
});

router.get('/formats', readLimiter, controller.formats);
router.get('/registry', readLimiter, controller.registry);
router.get('/symbols', readLimiter, controller.list);
router.get('/symbols/:canonical', readLimiter, controller.lookup);
router.get('/symbols/:symbol/describe', readLimiter, controller.describe);
router.get('/symbols/:symbol/normalize', readLimiter, controller.normalize);
router.get('/symbols/:symbol/classify', readLimiter, controller.classify);
router.post('/symbols/normalize/batch', writeLimiter, controller.normalizeBatch);
router.post('/fingerprint', writeLimiter, controller.fingerprint);

router.use((error, req, res, _next) => {
  if (isCryptoError(error)) {
    const { statusCode, body } = toCryptoResponse(error);
    return res.status(statusCode).json(body);
  }
  return res.status(500).json({
    message: 'An unexpected error occurred in the crypto signals subsystem',
    error: { code: 'CRYPTO_INTERNAL_ERROR' },
  });
});

module.exports = router;