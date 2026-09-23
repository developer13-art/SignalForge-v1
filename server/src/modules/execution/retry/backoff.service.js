/**
 * Backoff Service
 *
 * @module signalforge/server/modules/execution/retry/backoff
 */

import {
  DEFAULT_RETRY_DELAY_MS,
  DEFAULT_MAX_RETRY_DELAY_MS,
} from '../execution.constants.js';

const DEFAULT_FACTOR = 2;
const DEFAULT_JITTER_FACTOR = 0.25;

export class BackoffService {
  constructor(options = {}) {
    this.baseDelayMs = options.baseDelayMs || DEFAULT_RETRY_DELAY_MS;
    this.maxDelayMs = options.maxDelayMs || DEFAULT_MAX_RETRY_DELAY_MS;
    this.factor = options.factor || DEFAULT_FACTOR;
    this.jitterFactor = options.jitterFactor ?? DEFAULT_JITTER_FACTOR;
  }

  calculate(attempt) {
    const exponential = this.baseDelayMs * Math.pow(this.factor, attempt - 1);
    const capped = Math.min(exponential, this.maxDelayMs);
    const jitterAmount = capped * this.jitterFactor;
    const jitter = (Math.random() * 2 - 1) * jitterAmount;
    return Math.max(0, Math.round(capped + jitter));
  }

  async sleep(attempt) {
    const delay = this.calculate(attempt);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return delay;
  }
}

export default BackoffService;