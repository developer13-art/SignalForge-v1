/**
 * Max Open Trades Check
 *
 * @module signalforge/server/modules/risk/checks/max-open-trades
 */

import { BaseCheck } from './base.check.js';
import { RiskRepository } from '../risk.repository.js';
import { RISK_CHECKS } from '../risk.constants.js';
import { emitRiskLimitHit } from '../risk.events.js';

export class MaxOpenTradesCheck extends BaseCheck {
  constructor(repository = null) {
    super(RISK_CHECKS.MAX_OPEN_TRADES);
    this.repository = repository || new RiskRepository();
  }

  async run(context) {
    const { userId, brokerAccountId, profile } = context;

    if (!profile || !profile.max_open_trades || profile.max_open_trades <= 0) {
      return this.pass();
    }

    const openCount = await this.repository.getCurrentOpenTradesCount(userId, brokerAccountId);

    if (openCount >= profile.max_open_trades) {
      await emitRiskLimitHit(userId, 'MAX_OPEN_TRADES', {
        openCount,
        maxOpenTrades: profile.max_open_trades,
      });
      return this.fail(
        `Open trades ${openCount} has reached the limit of ${profile.max_open_trades}`,
        { openCount, maxOpenTrades: profile.max_open_trades },
      );
    }

    return this.pass({
      openCount,
      maxOpenTrades: profile.max_open_trades,
    });
  }
}

export default MaxOpenTradesCheck;