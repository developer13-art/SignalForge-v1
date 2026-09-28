/**
 * Risk Check Registry
 *
 * @module signalforge/server/modules/risk/checks/registry
 */
const { RISK_CHECKS } = require('../risk.constants.js');
const { MaxDailyLossCheck } = require('./max-daily-loss.check.js');
const { MaxDrawdownCheck } = require('./max-drawdown.check.js');
const { TradingSessionCheck } = require('./trading-session.check.js');
const { NewsFilterCheck } = require('./news-filter.check.js');
const { MaxOpenTradesCheck } = require('./max-open-trades.check.js');
const { LotSizeCheck } = require('./lot-size.check.js');
const { DuplicateTradeCheck } = require('./duplicate-trade.check.js');
const { AlreadyClosedCheck } = require('./already-closed.check.js');
const { ProviderDisabledCheck } = require('./provider-disabled.check.js');
const { CorrelationCheck } = require('./correlation.check.js');
const { MarginCheck } = require('./margin.check.js');
const { SpreadCheck } = require('./spread.check.js');
const { SlippageCheck } = require('./slippage.check.js');

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
module.exports = CheckRegistry;