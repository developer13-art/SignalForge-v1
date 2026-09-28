'use strict';

/**
 * SignalForge - Solana Actions Header Constants
 *
 * Canonical header names used by Solana Actions and Blinks clients.
 * Kept in one place so client and server agree on exact spellings.
 */

const REQUEST_HEADERS = Object.freeze({
  ACCEPT_ENCODING: 'Accept-Encoding',
  CONTENT_ENCODING: 'Content-Encoding',
  CONTENT_TYPE: 'Content-Type',
  SOLANA_CLIENT: 'Solana-Client',
  X_BLOCKCHAIN_IDS: 'X-Blockchain-Ids',
  X_REQUEST_ID: 'X-Request-Id',
  X_IDEMPOTENCY_KEY: 'X-Idempotency-Key',
  IDEMPOTENCY_KEY: 'Idempotency-Key',
  AUTHORIZATION: 'Authorization',
});

const RESPONSE_HEADERS = Object.freeze({
  ACCESS_CONTROL_ALLOW_ORIGIN: 'Access-Control-Allow-Origin',
  ACCESS_CONTROL_ALLOW_METHODS: 'Access-Control-Allow-Methods',
  ACCESS_CONTROL_ALLOW_HEADERS: 'Access-Control-Allow-Headers',
  ACCESS_CONTROL_MAX_AGE: 'Access-Control-Max-Age',
  CONTENT_TYPE: 'Content-Type',
  X_ACTION_VERSION: 'X-Action-Version',
  X_BLOCKCHAIN_IDS: 'X-Blockchain-Ids',
  X_REQUEST_ID: 'X-Request-Id',
  X_RATELIMIT_LIMIT: 'X-RateLimit-Limit',
  X_RATELIMIT_REMAINING: 'X-RateLimit-Remaining',
  X_RATELIMIT_RESET: 'X-RateLimit-Reset',
  RETRY_AFTER: 'Retry-After',
});

const ACTIONS_REQUIRED_HEADERS = Object.freeze([
  REQUEST_HEADERS.ACCEPT_ENCODING,
  REQUEST_HEADERS.CONTENT_TYPE,
  REQUEST_HEADERS.SOLANA_CLIENT,
  REQUEST_HEADERS.X_BLOCKCHAIN_IDS,
]);

const ACTIONS_CORS_ALLOWED_HEADERS = Object.freeze([
  REQUEST_HEADERS.CONTENT_TYPE,
  REQUEST_HEADERS.CONTENT_ENCODING,
  REQUEST_HEADERS.ACCEPT_ENCODING,
  REQUEST_HEADERS.SOLANA_CLIENT,
  REQUEST_HEADERS.X_BLOCKCHAIN_IDS,
  REQUEST_HEADERS.AUTHORIZATION,
]);

const ACTIONS_CORS_ALLOWED_METHODS = Object.freeze(['GET', 'POST', 'OPTIONS']);

const ACTIONS_CORS_MAX_AGE_SECONDS = 86400;

module.exports = Object.freeze({
  REQUEST_HEADERS,
  RESPONSE_HEADERS,
  ACTIONS_REQUIRED_HEADERS,
  ACTIONS_CORS_ALLOWED_HEADERS,
  ACTIONS_CORS_ALLOWED_METHODS,
  ACTIONS_CORS_MAX_AGE_SECONDS,
});