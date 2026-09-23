/**
 * Spread Service
 *
 * @module signalforge/server/modules/risk/market-data/spread
 */

const SPREAD_CACHE_TTL_MS = 30000;

export class SpreadService {
  constructor() {
    this.cache = new Map();
  }

  isStale(entry) {
    return !entry || Date.now() - entry.timestamp > SPREAD_CACHE_TTL_MS;
  }

  setSpread(symbol, spreadPips) {
    if (!symbol) {
      return;
    }
    this.cache.set(String(symbol).toUpperCase(), {
      spreadPips: Number(spreadPips),
      timestamp: Date.now(),
    });
  }

  getSpread(symbol) {
    if (!symbol) {
      return null;
    }
    const entry = this.cache.get(String(symbol).toUpperCase());
    if (this.isStale(entry)) {
      return null;
    }
    return entry.spreadPips;
  }
}

export default SpreadService;