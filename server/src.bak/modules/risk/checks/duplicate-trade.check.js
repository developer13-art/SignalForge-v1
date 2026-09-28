/**
 * Duplicate Trade Check
 *
 * @module signalforge/server/modules/risk/checks/duplicate-trade
 */

import { BaseCheck } from './base.check.js';
import { RiskRepository } from '../risk.repository.js';
import { RISK_CHECKS } from '../risk.constants.js';
import { normalizeSymbol } from '@signalforge/shared/validators/symbol.validator';

const DUPLICATE_WINDOW_MINUTES = 5;

export class DuplicateTradeCheck extends BaseCheck {
  constructor(repository = null) {
    super(RISK_CHECKS.DUPLICATE_TRADE);
    this.repository = repository || new RiskRepository();
  }

  async run(context) {
    const { userId, brokerAccountId, signal } = context;

    const symbol = normalizeSymbol(signal?.normalizedSymbol || signal?.symbol);
    const direction = signal?.direction;

    if (!symbol || !direction) {
      return this.skip('NO_SYMBOL_OR_DIRECTION');
    }

    const openTrades = await this.repository.getOpenTradesForCorrelation(userId, brokerAccountId);

    const cutoff = Date.now() - DUPLICATE_WINDOW_MINUTES * 60 * 1000;

    for (const trade of openTrades) {
      const tradeSymbol = normalizeSymbol(trade.symbol);
      if (tradeSymbol === symbol && trade.direction === direction) {
        const openedAt = trade.opened_at ? new Date(trade.opened_at).getTime() : 0;
        if (openedAt >= cutoff) {
          return this.fail(
            `Duplicate trade detected for ${symbol} ${direction}`,
            { duplicateTradeId: trade.id, openedAt: trade.opened_at },
          );
        }
      }
    }

    return this.pass();
  }
}

export default DuplicateTradeCheck;