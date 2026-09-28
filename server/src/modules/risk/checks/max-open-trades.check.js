/**
 * Max Open Trades Check
 *
 * @module signalforge/server/modules/risk/checks/max-open-trades
 */
const { BaseCheck } = require('./base.check.js');
const { RiskRepository } = require('../risk.repository.js');
const { RISK_CHECKS } = require('../risk.constants.js');
const { emitRiskLimitHit } = require('../risk.events.js');
class MaxOpenTradesCheck extends BaseCheck {
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
module.exports = MaxOpenTradesCheck;
module.exports.MaxOpenTradesCheck = MaxOpenTradesCheck;
