/**
 * Symbol Spec Service
 *
 * @module signalforge/server/modules/risk/market-data/symbol-spec
 */

const SYMBOL_SPECS = Object.freeze({
  EURUSD: { pipSize: 0.0001, pipValuePerLot: 10, minVolume: 0.01, maxVolume: 100 },
  GBPUSD: { pipSize: 0.0001, pipValuePerLot: 10, minVolume: 0.01, maxVolume: 100 },
  USDJPY: { pipSize: 0.01, pipValuePerLot: 10, minVolume: 0.01, maxVolume: 100 },
  AUDUSD: { pipSize: 0.0001, pipValuePerLot: 10, minVolume: 0.01, maxVolume: 100 },
  USDCAD: { pipSize: 0.0001, pipValuePerLot: 10, minVolume: 0.01, maxVolume: 100 },
  USDCHF: { pipSize: 0.0001, pipValuePerLot: 10, minVolume: 0.01, maxVolume: 100 },
  NZDUSD: { pipSize: 0.0001, pipValuePerLot: 10, minVolume: 0.01, maxVolume: 100 },
  XAUUSD: { pipSize: 0.01, pipValuePerLot: 10, minVolume: 0.01, maxVolume: 50 },
  XAGUSD: { pipSize: 0.01, pipValuePerLot: 10, minVolume: 0.01, maxVolume: 50 },
  US30: { pipSize: 1, pipValuePerLot: 1, minVolume: 0.01, maxVolume: 50 },
  NAS100: { pipSize: 1, pipValuePerLot: 1, minVolume: 0.01, maxVolume: 50 },
  SPX500: { pipSize: 1, pipValuePerLot: 1, minVolume: 0.01, maxVolume: 50 },
  BTCUSD: { pipSize: 1, pipValuePerLot: 1, minVolume: 0.01, maxVolume: 10 },
  ETHUSD: { pipSize: 0.1, pipValuePerLot: 1, minVolume: 0.01, maxVolume: 10 },
});

const DEFAULT_SPEC = Object.freeze({
  pipSize: 0.0001,
  pipValuePerLot: 10,
  minVolume: 0.01,
  maxVolume: 100,
});

export class SymbolSpecService {
  getSpec(symbol) {
    if (!symbol) {
      return DEFAULT_SPEC;
    }
    const upper = String(symbol).toUpperCase();
    return SYMBOL_SPECS[upper] || DEFAULT_SPEC;
  }

  isKnown(symbol) {
    if (!symbol) {
      return false;
    }
    return Boolean(SYMBOL_SPECS[String(symbol).toUpperCase()]);
  }
}

export default SymbolSpecService;