/**
 * Retry Utilities
 *
 * @module server/utils/retry.util
 */

import { sleep } from './sleep.util';

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_DELAY_MS = 1000;

function calculateDelay({ attempt, baseDelay = DEFAULT_DELAY_MS, factor = 2, maxDelay = 30000, jitter = true }) {
  const exponential = baseDelay * Math.pow(factor, attempt - 1);
  const capped = Math.min(exponential, maxDelay);
  if (!jitter) {
    return capped;
  }
  const jitterAmount = capped * 0.25;
  return Math.max(0, capped + (Math.random() * 2 - 1) * jitterAmount);
}

export async function retry(fn, options = {}) {
  const maxAttempts = options.maxAttempts || DEFAULT_MAX_ATTEMPTS;
  const shouldRetry = options.shouldRetry;
  const onRetry = options.onRetry;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;

      if (attempt >= maxAttempts) {
        break;
      }

      if (typeof shouldRetry === 'function' && !shouldRetry(err, attempt)) {
        break;
      }

      const delayMs = calculateDelay({ attempt, ...options });

      if (typeof onRetry === 'function') {
        onRetry(err, attempt, delayMs);
      }

      await sleep(delayMs);
    }
  }

  throw lastError;
}

export async function retryWithResult(fn, options = {}) {
  const maxAttempts = options.maxAttempts || DEFAULT_MAX_ATTEMPTS;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn(attempt);
      return { success: true, result, attempts: attempt };
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await sleep(calculateDelay({ attempt, ...options }));
      }
    }
  }

  return { success: false, error: lastError, attempts: maxAttempts };
}

export function isRetryableError(error) {
  if (!error) {
    return false;
  }

  const retryableCodes = [
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN',
    'RATE_LIMIT',
    'SERVICE_UNAVAILABLE',
    'TIMEOUT',
  ];

  if (error.code && retryableCodes.includes(error.code)) {
    return true;
  }

  const status = error.status || error.statusCode;
  const retryableStatuses = [408, 425, 429, 500, 502, 503, 504];
  if (retryableStatuses.includes(status)) {
    return true;
  }

  const message = String(error.message || '').toLowerCase();
  return ['timeout', 'network', 'rate limit', 'temporary'].some((p) => message.includes(p));
}

export const retryUtil = {
  retry,
  retryWithResult,
  isRetryableError,
  calculateDelay,
};