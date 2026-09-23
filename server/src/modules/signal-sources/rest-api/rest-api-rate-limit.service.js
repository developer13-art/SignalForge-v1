/**
 * REST API Rate Limit Service
 *
 * @module signalforge/server/modules/signal-sources/rest-api/rate-limit
 */

const WINDOW_MS = 60000;

export class RestApiRateLimitService {
  constructor(maxRequestsPerMinute = 60) {
    this.max = maxRequestsPerMinute;
    this.windowMs = WINDOW_MS;
    this.buckets = new Map();
  }

  prune() {
    const cutoff = Date.now() - this.windowMs;
    for (const [key, entry] of this.buckets) {
      if (entry.start < cutoff) {
        this.buckets.delete(key);
      }
    }
  }

  check(key) {
    this.prune();
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || now - bucket.start >= this.windowMs) {
      this.buckets.set(key, { start: now, count: 1 });
      return { allowed: true, remaining: this.max - 1, resetMs: this.windowMs };
    }

    if (bucket.count >= this.max) {
      const resetMs = this.windowMs - (now - bucket.start);
      return { allowed: false, remaining: 0, resetMs };
    }

    bucket.count++;
    return {
      allowed: true,
      remaining: this.max - bucket.count,
      resetMs: this.windowMs - (now - bucket.start),
    };
  }
}

export default RestApiRateLimitService;