/**
 * Telegram Rate Limit Service
 *
 * Protects the platform from Telegram's own rate limits by throttling
 * outgoing and incoming operations per user and per operation type.
 * Uses a token-bucket style algorithm backed by in-memory state.
 * Emits a rate limit event when a bucket is exhausted so downstream
 * monitoring can detect abnormal activity.
 *
 * @module server/modules/signal-sources/telegram/reconnect/telegram-rate-limit.service
 */
const { AppError } = require('../../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../../lib/errors/error-codes');
const { logger } = require('../../../../lib/logger');
const { emitTelegramRateLimitHit } = require('../telegram.events');

const BUCKETS = new Map();

const LIMITS = Object.freeze({
  message: { capacity: 60, refillPerSecond: 1 },
  edit: { capacity: 30, refillPerSecond: 0.5 },
  delete: { capacity: 30, refillPerSecond: 0.5 },
  send_code: { capacity: 5, refillPerSecond: 5 / 3600 },
  sign_in: { capacity: 10, refillPerSecond: 10 / 3600 },
  list_dialogs: { capacity: 5, refillPerSecond: 5 / 60 },
  download_media: { capacity: 20, refillPerSecond: 0.33 },
  default: { capacity: 30, refillPerSecond: 1 },
});

function getBucketKey(userId, operation) {
  return `${userId}:${operation}`;
}

function refillBucket(bucket, limit) {
  const now = Date.now();
  const elapsedSeconds = (now - bucket.lastRefillAt) / 1000;
  bucket.tokens = Math.min(limit.capacity, bucket.tokens + elapsedSeconds * limit.refillPerSecond);
  bucket.lastRefillAt = now;
}

function getOrCreateBucket(userId, operation) {
  const key = getBucketKey(userId, operation);
  const limit = LIMITS[operation] || LIMITS.default;

  let bucket = BUCKETS.get(key);
  if (!bucket) {
    bucket = {
      tokens: limit.capacity,
      lastRefillAt: Date.now(),
      capacity: limit.capacity,
      refillPerSecond: limit.refillPerSecond,
    };
    BUCKETS.set(key, bucket);
  }

  return bucket;
}

export async function guard({ userId, operation = 'default', cost = 1 }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const bucket = getOrCreateBucket(userId, operation);
  refillBucket(bucket, bucket);

  if (bucket.tokens >= cost) {
    bucket.tokens -= cost;
    return { allowed: true, remaining: bucket.tokens };
  }

  const missing = cost - bucket.tokens;
  const waitMs = Math.ceil((missing / bucket.refillPerSecond) * 1000);

  await emitTelegramRateLimitHit({
    userId,
    operation,
    retryAfterMs: waitMs,
  }).catch((err) => logger.warn({ err }, 'Failed to emit rate limit event'));

  logger.warn({ userId, operation, waitMs }, 'Telegram rate limit hit');

  throw new AppError(
    `Rate limit exceeded for ${operation}; retry after ${waitMs} ms`,
    ERROR_CODES.TELEGRAM_RATE_LIMIT,
    429,
  );
}

export async function consume({ userId, operation = 'default', cost = 1 }) {
  const bucket = getOrCreateBucket(userId, operation);
  refillBucket(bucket, bucket);

  if (bucket.tokens >= cost) {
    bucket.tokens -= cost;
    return { consumed: true, remaining: bucket.tokens };
  }

  return { consumed: false, remaining: bucket.tokens };
}
function peek({ userId, operation = 'default' }) {
  const bucket = getOrCreateBucket(userId, operation);
  refillBucket(bucket, bucket);
  return {
    tokens: bucket.tokens,
    capacity: bucket.capacity,
    refillPerSecond: bucket.refillPerSecond,
  };
}
function resetBucket({ userId, operation }) {
  BUCKETS.delete(getBucketKey(userId, operation));
}
function resetAll() {
  BUCKETS.clear();
}
function listBuckets() {
  return Array.from(BUCKETS.entries()).map(([key, bucket]) => {
    const [userId, operation] = key.split(':');
    return {
      userId,
      operation,
      tokens: bucket.tokens,
      capacity: bucket.capacity,
    };
  });
}
const telegramRateLimitService = {
  guard,
  consume,
  peek,
  resetBucket,
  resetAll,
  listBuckets,
  LIMITS,
};
module.exports.telegramRateLimitService = telegramRateLimitService;
module.exports.peek = peek;
module.exports.resetBucket = resetBucket;
module.exports.resetAll = resetAll;
module.exports.listBuckets = listBuckets;
