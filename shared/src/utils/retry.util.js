/**
 * Retry Utilities
 *
 * Provides retry helpers used by the Execution Service, source
 * adapters, Solana clients, and payment providers to handle transient
 * failures gracefully.
 *
 * @module @signalforge/shared/utils/retry
 */

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_DELAY_MS = 1000;
const DEFAULT_BACKOFF_FACTOR = 2;
const DEFAULT_MAX_DELAY_MS = 30000;

export function sleep(ms) {
  if (typeof ms !== 'number' || ms < 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function calculateDelay(attempt, options = {}) {
  const baseDelay = options.baseDelay ?? DEFAULT_DELAY_MS;
  const factor = options.backoffFactor ?? DEFAULT_BACKOFF_FACTOR;
  const maxDelay = options.maxDelay ?? DEFAULT_MAX_DELAY_MS;
  const jitter = options.jitter ?? true;
  const jitterFactor = options.jitterFactor ?? 0.25;

  const exponential = baseDelay * Math.pow(factor, attempt - 1);
  const capped = Math.min(exponential, maxDelay);

  if (!jitter) {
    return capped;
  }

  const jitterAmount = capped * jitterFactor;
  const randomJitter = (Math.random() * 2 - 1) * jitterAmount;
  return Math.max(0, capped + randomJitter);
}

export async function retry(fn, options = {}) {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const onRetry = options.onRetry;
  const onFailure = options.onFailure;
  const shouldRetry = options.shouldRetry;
  const signal = options.signal;

  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (signal && signal.aborted) {
      throw new Error('Retry aborted');
    }

    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;

      if (attempt >= maxAttempts) {
        break;
      }

      if (typeof shouldRetry === 'function' && !shouldRetry(error, attempt)) {
        break;
      }

      const delay = calculateDelay(attempt, options);

      if (typeof onRetry === 'function') {
        onRetry(error, attempt, delay);
      }

      await sleep(delay);
    }
  }

  if (typeof onFailure === 'function') {
    onFailure(lastError);
  }

  throw lastError;
}

export async function retryWithResult(fn, options = {}) {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;

  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn(attempt);
      return { success: true, result, attempts: attempt };
    } catch (error) {
      lastError = error;

      if (attempt >= maxAttempts) {
        break;
      }

      const delay = calculateDelay(attempt, options);
      await sleep(delay);
    }
  }

  return { success: false, error: lastError, attempts: maxAttempts };
}

export async function retryUntil(fn, condition, options = {}) {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const delayMs = options.delayMs ?? DEFAULT_DELAY_MS;

  let lastResult = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      lastResult = await fn(attempt);
      if (condition(lastResult)) {
        return { success: true, result: lastResult, attempts: attempt };
      }
    } catch (error) {
      lastResult = { error };
    }

    if (attempt < maxAttempts) {
      await sleep(delayMs);
    }
  }

  return { success: false, result: lastResult, attempts: maxAttempts };
}

export function isRetryableError(error) {
  if (!error) {
    return false;
  }

  const code = error.code || error.status || error.statusCode;

  const retryableCodes = [
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN',
    'EPIPE',
    'EHOSTUNREACH',
    'ENETUNREACH',
    'RATE_LIMIT',
    'TOO_MANY_REQUESTS',
    'SERVICE_UNAVAILABLE',
    'TIMEOUT',
  ];

  if (typeof code === 'string' && retryableCodes.includes(code)) {
    return true;
  }

  const retryableStatuses = [408, 425, 429, 500, 502, 503, 504, 522, 524];
  if (typeof code === 'number' && retryableStatuses.includes(code)) {
    return true;
  }

  const message = String(error.message || '').toLowerCase();
  const retryablePhrases = [
    'timeout',
    'timed out',
    'network',
    'connection',
    'rate limit',
    'too many requests',
    'service unavailable',
    'temporary',
    'try again',
  ];

  return retryablePhrases.some((phrase) => message.includes(phrase));
}

export function withTimeout(promise, timeoutMs, timeoutMessage = 'Operation timed out') {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export async function poll(fn, condition, options = {}) {
  const maxAttempts = options.maxAttempts ?? 30;
  const intervalMs = options.intervalMs ?? 1000;
  const signal = options.signal;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (signal && signal.aborted) {
      throw new Error('Poll aborted');
    }

    try {
      const result = await fn(attempt);
      if (condition(result)) {
        return result;
      }
    } catch (error) {
      if (options.throwOnError) {
        throw error;
      }
    }

    if (attempt < maxAttempts) {
      await sleep(intervalMs);
    }
  }

  throw new Error(`Polling exceeded ${maxAttempts} attempts without meeting condition`);
}

export const RETRY_CONSTRAINTS = Object.freeze({
  defaultMaxAttempts: DEFAULT_MAX_ATTEMPTS,
  defaultDelayMs: DEFAULT_DELAY_MS,
  defaultBackoffFactor: DEFAULT_BACKOFF_FACTOR,
  defaultMaxDelayMs: DEFAULT_MAX_DELAY_MS,
});