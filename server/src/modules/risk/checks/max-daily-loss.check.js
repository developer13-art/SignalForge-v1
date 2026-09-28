/**
 * Max Daily Loss Check
 *
 * @module signalforge/server/modules/risk/checks/max-daily-loss
 */
const { BaseCheck } = require('./base.check.js');
const { RiskRepository } = require('../risk.repository.js');
const { RISK_CHECKS } = require('../risk.constants.js');
const { emitRiskDailyLossExceeded } = require('../risk.events.js');
class MaxDailyLossCheck extends BaseCheck {
  constructor(repository = null) {
    super(RISK_CHECKS.MAX_DAILY_LOSS);
    this.repository = repository || new RiskRepository();
  }

  async run(context) {
    const { userId, brokerAccountId, profile } = context;

    if (!profile) {
      return this.skip('NO_PROFILE');
    }

    if (!profile.max_daily_loss || profile.max_daily_loss <= 0) {
      return this.pass();
    }

    const today = new Date().toISOString().split('T')[0];
    const dailyLoss = await this.repository.getDailyLoss(userId, brokerAccountId, today);

    if (dailyLoss <= -Math.abs(profile.max_daily_loss)) {
      await emitRiskDailyLossExceeded(userId, dailyLoss, profile.max_daily_loss);
      return this.fail(
        `Daily loss ${dailyLoss.toFixed(2)} exceeds limit of ${profile.max_daily_loss}`,
        { dailyLoss, maxDailyLoss: profile.max_daily_loss },
      );
    }

    return this.pass({
      dailyLoss,
      maxDailyLoss: profile.max_daily_loss,
      remaining: profile.max_daily_loss + dailyLoss,
    });
  }
}
module.exports = MaxDailyLossCheck;
module.exports.MaxDailyLossCheck = MaxDailyLossCheck;
