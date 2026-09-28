/**
 * Pip Value Service
 *
 * @module signalforge/server/modules/risk/calculator/pip-value
 */

export class PipValueService {
  getPipSize(symbol) {
    if (!symbol) {
      return 0.0001;
    }
    const upper = String(symbol).toUpperCase();
    if (upper.endsWith('JPY')) {
      return 0.01;
    }
    if (upper === 'XAUUSD' || upper === 'XAGUSD') {
      return 0.01;
    }
    if (upper.startsWith('BTC') || upper.startsWith('ETH') || upper.startsWith('SOL')) {
      return 1;
    }
    if (['US30', 'NAS100', 'SPX500', 'GER40', 'UK100', 'JP225'].includes(upper)) {
      return 1;
    }
    return 0.0001;
  }

  getPipValuePerLot(symbol, price = 1) {
    const upper = String(symbol || '').toUpperCase();
    if (upper.endsWith('JPY')) {
      return 1000 / (price || 1);
    }
    if (upper === 'XAUUSD' || upper === 'XAGUSD') {
      return 10;
    }
    if (upper.startsWith('BTC') || upper.startsWith('ETH') || upper.startsWith('SOL')) {
      return 1;
    }
    if (['US30', 'NAS100', 'SPX500', 'GER40', 'UK100', 'JP225'].includes(upper)) {
      return 1;
    }
    return 10;
  }

  calculateDistanceInPips(symbol, price1, price2) {
    const pipSize = this.getPipSize(symbol);
    if (pipSize === 0) {
      return 0;
    }
    return Math.abs(Number(price1) - Number(price2)) / pipSize;
  }
}

export default PipValueService;