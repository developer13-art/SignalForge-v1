/**
 * Price Check
 *
 * @module signalforge/server/modules/validation/validators/price
 */

import { isValidPrice } from '@signalforge/shared/validators/price.validator';
import { VALIDATION_RESULTS, VALIDATION_CHECK_NAMES } from '../validation.constants.js';

export class PriceCheck {
  constructor() {
    this.name = VALIDATION_CHECK_NAMES.PRICE;
  }

  async run(signal, context = {}) {
    const entryType = signal?.entryType || 'MARKET';

    if (entryType !== 'MARKET') {
      if (signal.entryPrice === undefined || signal.entryPrice === null) {
        return {
          name: this.name,
          result: VALIDATION_RESULTS.FAILED,
          reason: 'Entry price is required for non-market orders',
        };
      }
      if (!isValidPrice(signal.entryPrice)) {
        return {
          name: this.name,
          result: VALIDATION_RESULTS.FAILED,
          reason: 'Entry price is invalid',
        };
      }
    }

    if (signal.stopLoss !== undefined && signal.stopLoss !== null) {
      if (!isValidPrice(signal.stopLoss)) {
        return {
          name: this.name,
          result: VALIDATION_RESULTS.FAILED,
          reason: 'Stop loss is invalid',
        };
      }
    }

    if (Array.isArray(signal.takeProfits)) {
      for (let i = 0; i < signal.takeProfits.length; i++) {
        if (!isValidPrice(signal.takeProfits[i])) {
          return {
            name: this.name,
            result: VALIDATION_RESULTS.FAILED,
            reason: `Take profit ${i + 1} is invalid`,
          };
        }
      }
    }

    const direction = signal.direction;
    const entry = signal.entryPrice;
    const sl = signal.stopLoss;

    if (entry !== null && entry !== undefined && sl !== null && sl !== undefined) {
      if (direction === 'BUY' && Number(sl) >= Number(entry)) {
        return {
          name: this.name,
          result: VALIDATION_RESULTS.FAILED,
          reason: 'For BUY orders, stop loss must be below entry price',
        };
      }
      if (direction === 'SELL' && Number(sl) <= Number(entry)) {
        return {
          name: this.name,
          result: VALIDATION_RESULTS.FAILED,
          reason: 'For SELL orders, stop loss must be above entry price',
        };
      }
    }

    if (context.requireStopLoss && (sl === null || sl === undefined)) {
      return {
        name: this.name,
        result: VALIDATION_RESULTS.FAILED,
        reason: 'Stop loss is required',
      };
    }

    if (
      context.requireTakeProfit &&
      (!Array.isArray(signal.takeProfits) || signal.takeProfits.length === 0)
    ) {
      return {
        name: this.name,
        result: VALIDATION_RESULTS.FAILED,
        reason: 'At least one take profit is required',
      };
    }

    return { name: this.name, result: VALIDATION_RESULTS.PASSED };
  }
}

export default PriceCheck;