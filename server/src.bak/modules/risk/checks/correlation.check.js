/**
 * Correlation Check
 *
 * @module signalforge/server/modules/risk/checks/correlation
 */

import { BaseCheck } from './base.check.js';
import { RiskRepository } from '../risk.repository.js';
import { RISK_CHECKS } from '../risk.constants.js';
import { emitRiskCorrelationBlocked } from '../risk.events.js';
import { normalizeSymbol } from '@signalforge/shared/validators/symbol.validator';

const CORRELATION_GROUPS = Object.freeze({
  USD_MAJORS: ['EURUSD', 'GBPUSD', 'AUDUSD', 'NZDUSD', 'USDCAD', 'USDCHF', 'USDJPY'],
  EUR_CROSSES: ['EURUSD', 'EURGBP', 'EURJPY'],
  GBP_CROSSES: ['GBPUSD', 'EURGBP', 'GBPJPY'],
  JPY_CROSSES: ['USDJPY', 'EURJPY', 'GBPJPY'],
  METALS: ['XAUUSD', 'XAGUSD'],
  CRYPTO: ['BTCUSD', 'ETHUSD', 'SOLUSD'],
  INDICES: ['US30', 'NAS100', 'SPX500'],
});

export class CorrelationCheck extends BaseCheck {
  constructor(repository = null) {
    super(RISK_CHECKS.CORRELATION);
    this.repository = repository || new RiskRepository();
  }

  findGroups(symbol) {
    const groups = [];
    for (const [groupName, symbols] of Object.entries(CORRELATION_GROUPS)) {
      if (symbols.includes(symbol)) {
        groups.push(groupName);
      }
    }
    return groups;
  }

  async run(context) {
    const { userId, brokerAccountId, profile, signal } = context;

    if (!profile || !profile.correlation_protection_enabled) {
      return this.pass();
    }

    const symbol = normalizeSymbol(signal?.normalizedSymbol || signal?.symbol);
    if (!symbol) {
      return this.skip('NO_SYMBOL');
    }

    const groups = this.findGroups(symbol);
    if (groups.length === 0) {
      return this.pass();
    }

    const maxCorrelated = profile.max_correlated_positions || 3;
    const openTrades = await this.repository.getOpenTradesForCorrelation(userId, brokerAccountId);

    let correlatedCount = 0;
    const correlatedTrades = [];

    for (const trade of openTrades) {
      const tradeSymbol = normalizeSymbol(trade.symbol);
      const tradeGroups = this.findGroups(tradeSymbol);
      const shared = tradeGroups.filter((g) => groups.includes(g));
      if (shared.length > 0) {
        correlatedCount++;
        correlatedTrades.push({ tradeId: trade.id, symbol: tradeSymbol, groups: shared });
      }
    }

    if (correlatedCount >= maxCorrelated) {
      await emitRiskCorrelationBlocked(userId, symbol, correlatedTrades);
      return this.fail(
        `Correlation exposure ${correlatedCount} has reached the limit of ${maxCorrelated}`,
        { correlatedCount, maxCorrelated, correlatedTrades },
      );
    }

    return this.pass({ correlatedCount, maxCorrelated });
  }
}

export default CorrelationCheck;