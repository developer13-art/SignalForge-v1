/**
 * MetaApi Rate Limit Service
 *
 * @module signalforge/server/modules/brokers/metaapi/rate-limit
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import { emitRateLimitHit } from '../broker.events.js';
import {
  DEFAULT_RATE_LIMIT_WINDOW_MS,
  DEFAULT_RATE_LIMIT_MAX,
} from '../broker.constants.js';

export class MetaApiRateLimitService {
  constructor(options = {}) {
    this.windowMs = options.windowMs || DEFAULT_RATE_LIMIT_WINDOW_MS;
    this.max = options.max || DEFAULT_RATE_LIMIT_MAX;
    this.buckets = new Map();
    this.logger = getLogger('metaapi-rate-limit');
  }

  prune() {
    const cutoff = Date.now() - this.windowMs;
    for (const [key, entry] of this.buckets.entries()) {
      if (entry.start < cutoff) {
        this.buckets.delete(key);
      }
    }
  }

  async check(key) {
    this.prune();
    const now = Date.now();
    let bucket = this.buckets.get(key);
    if (!bucket || now - bucket.start >= this.windowMs) {
      bucket = { start: now, count: 0 };
      this.buckets.set(key, bucket);
    }

    if (bucket.count >= this.max) {
      await emitRateLimitHit('metaapi', { key, count: bucket.count });
      return { allowed: false, remaining: 0 };
    }

    bucket.count++;
    return { allowed: true, remaining: this.max - bucket.count };
  }

  getStatus(key) {
    const bucket = this.buckets.get(key);
    if (!bucket) {
      return { count: 0, remaining: this.max };
    }
    return { count: bucket.count, remaining: Math.max(0, this.max - bucket.count) };
  }
}

export default MetaApiRateLimitService;