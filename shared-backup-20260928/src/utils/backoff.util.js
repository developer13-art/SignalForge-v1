/**
 * Backoff Utilities
 *
 * Provides backoff strategies used by retries, reconnection logic, and
 * rate-limit handling across the SignalForge platform.
 *
 * @module @signalforge/shared/utils/backoff
 */function constantBackoff(attempt, options = {}) {
  const delay = options.delay ?? 1000;
  return delay;
}function linearBackoff(attempt, options = {}) {
  const baseDelay = options.baseDelay ?? 1000;
  const increment = options.increment ?? 1000;
  const maxDelay = options.maxDelay ?? 30000;
  const delay = baseDelay + (attempt - 1) * increment;
  return Math.min(delay, maxDelay);
}function exponentialBackoff(attempt, options = {}) {
  const baseDelay = options.baseDelay ?? 1000;
  const factor = options.factor ?? 2;
  const maxDelay = options.maxDelay ?? 30000;
  const delay = baseDelay * Math.pow(factor, attempt - 1);
  return Math.min(delay, maxDelay);
}function exponentialBackoffWithJitter(attempt, options = {}) {
  const delay = exponentialBackoff(attempt, options);
  const jitterFactor = options.jitterFactor ?? 0.25;
  const jitterAmount = delay * jitterFactor;
  const randomJitter = (Math.random() * 2 - 1) * jitterAmount;
  return Math.max(0, delay + randomJitter);
}function decorrelatedJitter(attempt, previousDelay, options = {}) {
  const baseDelay = options.baseDelay ?? 1000;
  const maxDelay = options.maxDelay ?? 30000;
  const factor = options.factor ?? 3;

  const upperBound = Math.min(maxDelay, previousDelay * factor);
  const lowerBound = baseDelay;

  return lowerBound + Math.random() * (upperBound - lowerBound);
}function fibonacciBackoff(attempt, options = {}) {
  const baseDelay = options.baseDelay ?? 1000;
  const maxDelay = options.maxDelay ?? 30000;

  let a = 1;
  let b = 1;

  for (let i = 1; i < attempt; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }

  const delay = baseDelay * a;
  return Math.min(delay, maxDelay);
}function calculateBackoff(attempt, strategy = 'exponential', options = {}) {
  switch (strategy) {
    case 'constant':
      return constantBackoff(attempt, options);
    case 'linear':
      return linearBackoff(attempt, options);
    case 'exponential':
      return exponentialBackoff(attempt, options);
    case 'exponential-jitter':
      return exponentialBackoffWithJitter(attempt, options);
    case 'fibonacci':
      return fibonacciBackoff(attempt, options);
    default:
      return exponentialBackoff(attempt, options);
  }
}function createBackoffIterator(options = {}) {
  const strategy = options.strategy || 'exponential-jitter';
  const maxAttempts = options.maxAttempts ?? Infinity;
  let attempt = 0;

  return {
    next() {
      attempt++;
      if (attempt > maxAttempts) {
        return { done: true, value: undefined };
      }
      return {
        done: false,
        value: {
          attempt,
          delay: calculateBackoff(attempt, strategy, options),
        },
      };
    },
    reset() {
      attempt = 0;
    },
    get attempts() {
      return attempt;
    },
  };
}const BACKOFF_STRATEGIES = Object.freeze({
  CONSTANT: 'constant',
  LINEAR: 'linear',
  EXPONENTIAL: 'exponential',
  EXPONENTIAL_JITTER: 'exponential-jitter',
  FIBONACCI: 'fibonacci',
});const BACKOFF_CONSTRAINTS = Object.freeze({
  defaultBaseDelay: 1000,
  defaultMaxDelay: 30000,
  defaultFactor: 2,
  defaultJitterFactor: 0.25,
});

module.exports.constantBackoff = constantBackoff;
module.exports.linearBackoff = linearBackoff;
module.exports.exponentialBackoff = exponentialBackoff;
module.exports.exponentialBackoffWithJitter = exponentialBackoffWithJitter;
module.exports.decorrelatedJitter = decorrelatedJitter;
module.exports.fibonacciBackoff = fibonacciBackoff;
module.exports.calculateBackoff = calculateBackoff;
module.exports.createBackoffIterator = createBackoffIterator;
module.exports.BACKOFF_STRATEGIES = BACKOFF_STRATEGIES;
module.exports.BACKOFF_CONSTRAINTS = BACKOFF_CONSTRAINTS;
