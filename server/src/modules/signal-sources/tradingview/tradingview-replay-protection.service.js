/**
 * TradingView Replay Protection Service
 *
 * Prevents webhook replay attacks by tracking recently seen request
 * signatures within a sliding time window.
 *
 * @module signalforge/server/modules/signal-sources/tradingview/replay-protection
 */

import crypto from 'node:crypto';

import tradingViewConfig from '../../../config/tradingview.config.js';

export class TradingViewReplayProtectionService {
  constructor(config = null) {
    this.config = config || tradingViewConfig.replayProtection;
    this.cache = new Map();
  }

  hashRequest(payload) {
    const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  cleanup() {
    const cutoff = Date.now() - this.config.windowSeconds * 1000;
    for (const [hash, timestamp] of this.cache) {
      if (timestamp < cutoff) {
        this.cache.delete(hash);
      }
    }
  }

  assertUnique(payload) {
    if (!this.config.enabled) {
      return { unique: true };
    }

    this.cleanup();

    const hash = this.hashRequest(payload);
    if (this.cache.has(hash)) {
      return { unique: false, hash };
    }

    this.cache.set(hash, Date.now());

    if (this.cache.size > this.config.cacheSize) {
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }

    return { unique: true, hash };
  }
}

export default TradingViewReplayProtectionService;