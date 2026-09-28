/**
 * Broker Mapping Service
 *
 * @module signalforge/server/modules/brokers/registry/broker-mapping
 */

import { BROKER_PLATFORMS } from '../broker.constants.js';

const SYMBOL_MAPS = Object.freeze({
  [BROKER_PLATFORMS.MT4]: {
    XAUUSD: ['XAUUSD', 'GOLD', 'GOLD.spot'],
    XAGUSD: ['XAGUSD', 'SILVER', 'SILVER.spot'],
    EURUSD: ['EURUSD', 'EURUSD.pro'],
    GBPUSD: ['GBPUSD', 'GBPUSD.pro'],
    USDJPY: ['USDJPY', 'USDJPY.pro'],
  },
  [BROKER_PLATFORMS.MT5]: {
    XAUUSD: ['XAUUSD', 'GOLD', 'GOLD.spot', 'XAUUSDm'],
    XAGUSD: ['XAGUSD', 'SILVER', 'SILVER.spot', 'XAGUSDm'],
    EURUSD: ['EURUSD', 'EURUSD.pro', 'EURUSDm'],
    GBPUSD: ['GBPUSD', 'GBPUSD.pro', 'GBPUSDm'],
    USDJPY: ['USDJPY', 'USDJPY.pro', 'USDJPYm'],
    NAS100: ['NAS100', 'USTEC', 'US100'],
    SPX500: ['SPX500', 'US500'],
  },
});

export class BrokerMappingService {
  getSymbolCandidates(platform, canonicalSymbol) {
    const map = SYMBOL_MAPS[platform] || SYMBOL_MAPS[BROKER_PLATFORMS.MT5];
    return map[canonicalSymbol] || [canonicalSymbol];
  }

  resolveSymbol(platform, brokerSymbol) {
    const map = SYMBOL_MAPS[platform] || SYMBOL_MAPS[BROKER_PLATFORMS.MT5];
    for (const [canonical, variants] of Object.entries(map)) {
      if (variants.includes(brokerSymbol)) {
        return canonical;
      }
    }
    return brokerSymbol;
  }

  normalizeToCanonical(platform, brokerSymbol) {
    return this.resolveSymbol(platform, brokerSymbol);
  }
}

export default BrokerMappingService;