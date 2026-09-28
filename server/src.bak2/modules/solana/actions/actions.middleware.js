'use strict';

const crypto = require('crypto');

const {
  ACTIONS_RESPONSE_HEADERS,
  ACTIONS_VERSION_HEADER_VALUE,
  ACTIONS_CHAIN_IDS,
  ACTIONS_CORS_MAX_AGE_SECONDS,
  ACTIONS_METRICS,
} = require('./actions.constants');

const { config } = require('./actions.config');
const { isActionsError, toActionsResponse, RateLimitedError } = require('./actions.errors');

/**
 * In-memory sliding-window rate limiter for the Solana Actions endpoints.
 * The platform does not use Redis, so this limiter is intentionally
 * process-local. Horizontal replicas each hold their own window, which
 * is acceptable because Solana Actions traffic is low-volume and the
 * upstream clients (X, wallets) do not aggressively retry.
 */
function createRateLimiter({ windowMs, max }) {
  const buckets = new Map();

  function cleanup(now) {
    for (const [key, entry] of buckets.entries()) {
      if (entry.resetAt <= now) {
        buckets.delete(key);
      }
    }
  }

  return function rateLimit(req, res, next) {
    const now = Date.now();
    const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const normalizedKey = Array.isArray(key) ? key[0] : String(key);

    cleanup(now);

    let entry = buckets.get(normalizedKey);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      buckets.set(normalizedKey, entry);
    }

    entry.count += 1;

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      return next(new RateLimitedError('Too many requests to the Solana Actions endpoint', {
        retryAfter,
        windowMs,
        max,
      }));
    }

    return next();
  };
}

function resolveAllowedOrigins() {
  const configured = Array.isArray(config.cors.allowedOrigins) && config.cors.allowedOrigins.length > 0
    ? config.cors.allowedOrigins
    : [];

  return configured;
}

function isOriginAllowed(origin) {
  if (!origin) {
    return false;
  }

  const allowed = resolveAllowedOrigins();
  if (allowed.length === 0) {
    return false;
  }

  for (const pattern of allowed) {
    if (pattern === '*') {
      return true;
    }

    if (pattern === origin) {
      return true;
    }

    if (pattern.includes('*')) {
      const escaped = pattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\\\*/g, '.*');
      const regex = new RegExp(`^${escaped}$`);
      if (regex.test(origin)) {
        return true;
      }
    }
  }

  return false;
}

function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;

  if (origin && isOriginAllowed(origin)) {
    res.setHeader(ACTIONS_RESPONSE_HEADERS.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
    res.setHeader('Vary', 'Origin');
  } else if (!origin) {
    res.setHeader(ACTIONS_RESPONSE_HEADERS.ACCESS_CONTROL_ALLOW_ORIGIN, '*');
  }

  res.setHeader(
    ACTIONS_RESPONSE_HEADERS.ACCESS_CONTROL_ALLOW_METHODS,
    config.cors.allowedMethods.join(', '),
  );
  res.setHeader(
    ACTIONS_RESPONSE_HEADERS.ACCESS_CONTROL_ALLOW_HEADERS,
    config.cors.allowedHeaders.join(', '),
  );
  res.setHeader(
    ACTIONS_RESPONSE_HEADERS.ACCESS_CONTROL_MAX_AGE,
    String(config.cors.maxAgeSeconds || ACTIONS_CORS_MAX_AGE_SECONDS),
  );

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  return next();
}

function protocolHeadersMiddleware(_req, res, next) {
  res.setHeader(ACTIONS_RESPONSE_HEADERS.X_ACTION_VERSION, ACTIONS_VERSION_HEADER_VALUE);
  res.setHeader(
    ACTIONS_RESPONSE_HEADERS.X_BLOCKCHAIN_IDS,
    ACTIONS_CHAIN_IDS.SOLANA_MAINNET,
  );
  return next();
}

function requestIdMiddleware(req, res, next) {
  const existing = req.headers['x-request-id'];
  const requestId = existing && typeof existing === 'string' && existing.trim()
    ? existing.trim()
    : crypto.randomUUID();

  req.actionsRequestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  return next();
}

function contentEncodingMiddleware(req, res, next) {
  if (req.method === 'GET') {
    return next();
  }

  const encoding = req.headers['content-encoding'];
  if (encoding && typeof encoding === 'string' && encoding.trim().toLowerCase() !== 'identity') {
    return res.status(415).json({
      message: 'Unsupported Content-Encoding. Only identity encoding is allowed.',
      error: { code: 'UNSUPPORTED_CONTENT_ENCODING' },
    });
  }

  return next();
}

function blockchainIdsMiddleware(req, res, next) {
  const header = req.headers['x-blockchain-ids'];
  if (!header) {
    return next();
  }

  const values = String(header)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  req.solanaActionsChains = values;
  return next();
}

function errorHandlerMiddleware(error, req, res, _next) {
  const { statusCode, body } = toActionsResponse(error);

  if (!isActionsError(error)) {
    req.log?.error?.({ err: error, requestId: req.actionsRequestId }, 'Unhandled Solana Actions error');
  } else {
    req.log?.warn?.(
      { code: error.code, message: error.message, requestId: req.actionsRequestId },
      'Solana Actions error',
    );
  }

  if (res.headersSent) {
    return;
  }

  return res.status(statusCode).json(body);
}

function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();
  const method = req.method.toUpperCase();

  res.on('finish', () => {
    const durationNs = Number(process.hrtime.bigint() - start);
    const durationMs = durationNs / 1e6;
    const metricName = method === 'GET' ? ACTIONS_METRICS.GET_REQUESTS : ACTIONS_METRICS.POST_REQUESTS;

    req.app?.locals?.metrics?.observe?.(metricName, durationMs, {
      status: res.statusCode,
      method,
    });

    if (res.statusCode >= 500) {
      req.app?.locals?.metrics?.increment?.(ACTIONS_METRICS.FAILURES, {
        status: res.statusCode,
      });
    }
  });

  return next();
}

function buildGetRateLimiter() {
  return createRateLimiter({
    windowMs: config.rateLimit.getWindowMs,
    max: config.rateLimit.getMax,
  });
}

function buildPostRateLimiter() {
  return createRateLimiter({
    windowMs: config.rateLimit.postWindowMs,
    max: config.rateLimit.postMax,
  });
}

module.exports = {
  corsMiddleware,
  protocolHeadersMiddleware,
  requestIdMiddleware,
  contentEncodingMiddleware,
  blockchainIdsMiddleware,
  errorHandlerMiddleware,
  metricsMiddleware,
  buildGetRateLimiter,
  buildPostRateLimiter,
  isOriginAllowed,
  createRateLimiter,
};