'use strict';

const cors = require('cors');
const { config } = require('../config');
const actionsConstants = require('../modules/solana/actions/actions.constants');

/**
 * SignalForge - CORS Middleware
 *
 * Two configuration modes:
 *
 * 1. The standard API surface uses the configured CORS_ORIGINS list.
 *    This is the default for every route except Solana Actions.
 *
 * 2. Solana Actions endpoints must accept requests from X (Twitter),
 *    Dialect, and wallet clients. They use a dedicated middleware
 *    defined in `actions.middleware.js`, not this file. This CORS
 *    middleware is only used for the rest of the API.
 */

function resolveOrigins() {
  const raw = config?.cors?.origins || process.env.CORS_ORIGINS || '';
  if (Array.isArray(raw)) {
    return raw;
  }
  return String(raw)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function buildCorsOptions() {
  const allowedOrigins = resolveOrigins();

  return {
    origin(origin, callback) {
      // Same-origin requests have no Origin header.
      if (!origin) {
        return callback(null, true);
      }

      // In development allow any origin to make local testing simpler.
      if (config?.env === 'development' && allowedOrigins.length === 0) {
        return callback(null, true);
      }

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Solana Actions origins are allowed only on their own routes,
      // not on the general API surface.
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-Id',
      'X-Idempotency-Key',
      'Idempotency-Key',
      'Solana-Client',
      'X-Blockchain-Ids',
      'Accept-Encoding',
    ],
    exposedHeaders: [
      'X-Request-Id',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'Retry-After',
      actionsConstants.ACTIONS_RESPONSE_HEADERS.X_ACTION_VERSION,
    ],
    maxAge: 86400,
  };
}

function corsMiddleware() {
  return cors(buildCorsOptions());
}

module.exports = corsMiddleware;
module.exports.buildCorsOptions = buildCorsOptions;
module.exports.resolveOrigins = resolveOrigins;