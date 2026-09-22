/**
 * Rate Limit Middleware
 *
 * Applies a global rate limit to the Express application. Endpoint-
 * specific rate limits are applied inside route modules.
 *
 * @module signalforge/server/middleware/rate-limit
 */

import rateLimit from 'express-rate-limit';

import rateLimitConfig from '../config/rate-limit.config.js';
import appConfig from '../config/app.config.js';

export function rateLimitMiddleware() {
  if (!rateLimitConfig.enabled) {
    return (req, res, next) => next();
  }

  if (appConfig.isTest) {
    return (req, res, next) => next();
  }

  return rateLimit({
    windowMs: rateLimitConfig.global.windowMs,
    max: rateLimitConfig.global.max,
    message: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: rateLimitConfig.global.message,
      },
    },
    standardHeaders: rateLimitConfig.global.standardHeaders,
    legacyHeaders: rateLimitConfig.global.legacyHeaders,
    skip: (req) => {
      if (req.path === '/api/health' || req.path === '/api/health/live' || req.path === '/api/health/ready') {
        return true;
      }
      if (req.path.startsWith('/api/webhooks')) {
        return true;
      }
      return false;
    },
    keyGenerator: (req) => {
      if (req.user && req.user.id) {
        return `user:${req.user.id}`;
      }
      return `ip:${req.ip}`;
    },
    handler: (req, res, next, options) => {
      res.status(429).json(options.message);
    },
  });
}

export default rateLimitMiddleware;