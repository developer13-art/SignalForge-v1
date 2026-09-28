/**
 * Market Tradable Check
 *
 * @module signalforge/server/modules/validation/validators/market-tradable
 */

import {
  VALIDATION_RESULTS,
  VALIDATION_CHECK_NAMES,
  MARKET_CLOSED_DAYS,
} from '../validation.constants.js';

export class MarketTradableCheck {
  constructor() {
    this.name = VALIDATION_CHECK_NAMES.MARKET_TRADABLE;
  }

  isMarketOpen(date = new Date()) {
    const day = date.getUTCDay();
    if (MARKET_CLOSED_DAYS.includes(day)) {
      return false;
    }
    if (day === 0 && date.getUTCHours() >= 22) {
      return false;
    }
    if (day === 5 && date.getUTCHours() >= 22) {
      return false;
    }
    return true;
  }

  async run(signal, context = {}) {
    const referenceTime = context.referenceTime
      ? new Date(context.referenceTime)
      : new Date();

    if (!this.isMarketOpen(referenceTime)) {
      if (context.allowClosedMarket) {
        return { name: this.name, result: VALIDATION_RESULTS.WARNING, reason: 'Market is closed' };
      }
      return {
        name: this.name,
        result: VALIDATION_RESULTS.FAILED,
        reason: 'Market is closed for this symbol',
      };
    }

    return { name: this.name, result: VALIDATION_RESULTS.PASSED };
  }
}

export default MarketTradableCheck;