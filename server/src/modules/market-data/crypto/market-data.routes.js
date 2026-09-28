'use strict';

const express = require('express');

const controller = require('./market-data.controller');
const { toMarketDataResponse, isMarketDataError } = require('./market-data.errors');

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
        error: { code: 'MARKET_DATA_RATE_LIMITED' },
      });
    }
    return next();
  };
}

const readLimiter = rateLimit({ windowMs: 60000, max: 300 });
const heavyLimiter = rateLimit({ windowMs: 60000, max: 60 });

router.get('/health', readLimiter, controller.health);
router.get('/symbols/:symbol/describe', readLimiter, controller.describeSymbol);

router.get('/prices/:symbol', readLimiter, controller.getPrice);
router.post('/prices/batch', heavyLimiter, controller.getPricesBatch);
router.get('/prices/:symbol/historical', readLimiter, controller.getHistoricalPrice);
router.get('/prices/:symbol/volatility', readLimiter, controller.getVolatility);

router.get('/liquidity/:symbol', readLimiter, controller.getLiquidity);
router.get('/liquidity/pool/:poolId', readLimiter, controller.getPoolLiquidity);
router.get('/liquidity/tiers', readLimiter, controller.getLiquidityTiers);

router.get('/volume/:symbol', readLimiter, controller.getVolume);
router.get('/volume/:symbol/summary', readLimiter, controller.getVolumeSummary);
router.get('/volume/top', readLimiter, controller.listTopVolume);

router.get('/pools', readLimiter, controller.listPools);
router.get('/pools/by-mints', readLimiter, controller.findPoolsByMints);
router.get('/pools/:source/:address', readLimiter, controller.describePool);

router.get('/tokens', readLimiter, controller.listTokens);
router.get('/tokens/tag/:tag', readLimiter, controller.listTokensByTag);
router.get('/tokens/:mint', readLimiter, controller.getToken);

router.use((error, _req, res, _next) => {
  if (isMarketDataError(error)) {
    const { statusCode, body } = toMarketDataResponse(error);
    return res.status(statusCode).json(body);
  }
  return res.status(500).json({
    message: 'An unexpected error occurred in the crypto market data subsystem',
    error: { code: 'MARKET_DATA_INTERNAL_ERROR' },
  });
});

module.exports = router;