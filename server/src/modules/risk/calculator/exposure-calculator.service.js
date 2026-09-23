/**
 * Exposure Calculator Service
 *
 * @module signalforge/server/modules/risk/calculator/exposure
 */

import { normalizeSymbol } from '@signalforge/shared/validators/symbol.validator';

const CURRENCY_PAIRS = Object.freeze([
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF',
]);

export class ExposureCalculatorService {
  extractCurrencies(symbol) {
    const normalized = normalizeSymbol(symbol);
    if (!normalized) {
      return [];
    }
    if (normalized.length === 6) {
      const base = normalized.substring(0, 3);
      const quote = normalized.substring(3, 6);
      if (CURRENCY_PAIRS.includes(base) && CURRENCY_PAIRS.includes(quote)) {
        return [base, quote];
      }
    }
    return [];
  }

  calculate(openTrades, newTrade) {
    const exposures = {};

    for (const trade of openTrades) {
      const currencies = this.extractCurrencies(trade.symbol);
      const volume = Number(trade.remaining_volume || trade.volume || 0);
      for (const currency of currencies) {
        exposures[currency] = (exposures[currency] || 0) + volume;
      }
    }

    const newCurrencies = this.extractCurrencies(newTrade.symbol);
    const newVolume = Number(newTrade.volume || 0);

    const simulatedExposures = { ...exposures };
    for (const currency of newCurrencies) {
      simulatedExposures[currency] = (simulatedExposures[currency] || 0) + newVolume;
    }

    return {
      current: exposures,
      simulated: simulatedExposures,
      newCurrencies,
    };
  }
}

export default ExposureCalculatorService;