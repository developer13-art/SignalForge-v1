/**
 * LLM Rate Limiter Service
 *
 * @module signalforge/server/modules/ai-signal-intelligence/llm/rate-limiter
 */

const WINDOW_MS = 60000;

export class LlmRateLimiterService {
  constructor(options = {}) {
    this.requestsPerMinute = options.requestsPerMinute || 500;
    this.tokensPerMinute = options.tokensPerMinute || 90000;
    this.concurrentRequests = options.concurrentRequests || 20;
    this.windows = new Map();
    this.inFlight = 0;
  }

  prune() {
    const cutoff = Date.now() - WINDOW_MS;
    for (const [key, entry] of this.windows) {
      if (entry.start < cutoff) {
        this.windows.delete(key);
      }
    }
  }

  getWindow(key) {
    const entry = this.windows.get(key);
    if (!entry || Date.now() - entry.start >= WINDOW_MS) {
      const fresh = { start: Date.now(), requests: 0, tokens: 0 };
      this.windows.set(key, fresh);
      return fresh;
    }
    return entry;
  }

  checkRequests(key, count = 1) {
    this.prune();
    const window = this.getWindow(key);
    if (window.requests + count > this.requestsPerMinute) {
      return { allowed: false, reason: 'REQUESTS', resetMs: WINDOW_MS - (Date.now() - window.start) };
    }
    return { allowed: true, remaining: this.requestsPerMinute - window.requests - count };
  }

  checkTokens(key, tokens) {
    this.prune();
    const window = this.getWindow(key);
    if (window.tokens + tokens > this.tokensPerMinute) {
      return { allowed: false, reason: 'TOKENS', resetMs: WINDOW_MS - (Date.now() - window.start) };
    }
    return { allowed: true, remaining: this.tokensPerMinute - window.tokens - tokens };
  }

  checkConcurrency() {
    if (this.inFlight >= this.concurrentRequests) {
      return { allowed: false, reason: 'CONCURRENCY' };
    }
    return { allowed: true, available: this.concurrentRequests - this.inFlight };
  }

  commit(key, tokens) {
    const window = this.getWindow(key);
    window.requests += 1;
    window.tokens += tokens;
  }

  beginRequest() {
    this.inFlight++;
  }

  endRequest() {
    this.inFlight = Math.max(0, this.inFlight - 1);
  }
}

export default LlmRateLimiterService;