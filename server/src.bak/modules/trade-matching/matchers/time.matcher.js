/**
 * Time Matcher
 *
 * @module signalforge/server/modules/trade-matching/matchers/time
 */

import { DEFAULT_TIME_WINDOW_MS } from '../matching.constants.js';

export class TimeMatcher {
  constructor(windowMs = DEFAULT_TIME_WINDOW_MS) {
    this.windowMs = windowMs;
  }

  scoreTrade(trade, referenceTime, options = {}) {
    if (!trade) {
      return 0;
    }
    const windowMs = options.windowMs || this.windowMs;
    const openedAt = trade.opened_at ? new Date(trade.opened_at).getTime() : null;
    if (!openedAt || !referenceTime) {
      return 0;
    }
    const diff = Math.abs(referenceTime - openedAt);
    if (diff > windowMs) {
      return 0;
    }
    const proximity = 1 - diff / windowMs;
    return Math.max(0, Math.min(1, proximity));
  }

  scoreTrades(trades, referenceTime, options = {}) {
    if (!Array.isArray(trades)) {
      return [];
    }
    return trades.map((trade) => {
      const score = this.scoreTrade(trade, referenceTime, options);
      return { trade, score, factors: { time: score } };
    });
  }
}

export default TimeMatcher;