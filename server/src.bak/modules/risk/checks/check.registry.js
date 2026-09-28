/**
 * Risk Check Registry
 *
 * @module signalforge/server/modules/risk/checks/registry
 */

import { RISK_CHECKS } from '../risk.constants.js';
import { MaxDailyLossCheck } from './max-daily-loss.check.js';
import { MaxDrawdownCheck } from './max-drawdown.check.js';
import { TradingSessionCheck } from './trading-session.check.js';
import { NewsFilterCheck } from './news-filter.check.js';
import { MaxOpenTradesCheck } from './max-open-trades.check.js';
import { LotSizeCheck } from './lot-size.check.js';
import { DuplicateTradeCheck } from './duplicate-trade.check.js';
import { AlreadyClosedCheck } from './already-closed.check.js';
import { ProviderDisabledCheck } from './provider-disabled.check.js';
import { CorrelationCheck } from './correlation.check.js';
import { MarginCheck } from './margin.check.js';
import { SpreadCheck } from './spread.check.js';
import { SlippageCheck } from './slippage.check.js';

const registry = new Map();

registry.set(RISK_CHECKS.MAX_DAILY_LOSS, () => new MaxDailyLossCheck());
registry.set(RISK_CHECKS.MAX_DRAWDOWN, () => new MaxDrawdownCheck());
registry.set(RISK_CHECKS.TRADING_SESSION, () => new TradingSessionCheck());
registry.set(RISK_CHECKS.NEWS_FILTER, () => new NewsFilterCheck());
registry.set(RISK_CHECKS.MAX_OPEN_TRADES, () => new MaxOpenTradesCheck());
registry.set(RISK_CHECKS.LOT_SIZE, () => new LotSizeCheck());
registry.set(RISK_CHECKS.DUPLICATE_TRADE, () => new DuplicateTradeCheck());
registry.set(RISK_CHECKS.ALREADY_CLOSED, () => new AlreadyClosedCheck());
registry.set(RISK_CHECKS.PROVIDER_DISABLED, () => new ProviderDisabledCheck());
registry.set(RISK_CHECKS.CORRELATION, () => new CorrelationCheck());
registry.set(RISK_CHECKS.MARGIN, () => new MarginCheck());
registry.set(RISK_CHECKS.SPREAD, () => new SpreadCheck());
registry.set(RISK_CHECKS.SLIPPAGE, () => new SlippageCheck());

export class CheckRegistry {
  static register(checkName, factory) {
    if (typeof factory !== 'function') {
      throw new Error('Check factory must be a function');
    }
    registry.set(checkName, factory);
  }

  static create(checkName, options = {}) {
    const factory = registry.get(checkName);
    if (!factory) {
      return null;
    }
    const check = factory();
    if (options.dependencies) {
      Object.assign(check, options.dependencies);
    }
    return check;
  }

  static createAll(dependencies = {}) {
    const checks = [];
    for (const [checkName, factory] of registry.entries()) {
      const check = factory();
      if (dependencies) {
        Object.assign(check, dependencies);
      }
      checks.push(check);
    }
    return checks;
  }

  static list() {
    return Array.from(registry.keys());
  }
}

export default CheckRegistry;