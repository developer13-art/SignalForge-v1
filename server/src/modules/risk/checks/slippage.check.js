/**
 * Slippage Check
 *
 * @module signalforge/server/modules/risk/checks/slippage
 */
const { BaseCheck } = require('./base.check.js');
const { RISK_CHECKS } = require('../risk.constants.js');
const { emitRiskSlippageExceeded } = require('../risk.events.js');
class SlippageCheck extends BaseCheck {
  constructor() {
    super(RISK_CHECKS.SLIPPAGE);
  }

  async run(context) {
    const { profile, userId, signal, estimatedSlippage } = context;

    if (!profile || !profile.max_slippage_pips || profile.max_slippage_pips <= 0) {
      return this.pass();
    }

    if (estimatedSlippage === undefined || estimatedSlippage === null) {
      return this.skip('NO_SLIPPAGE_DATA');
    }

    if (Number(estimatedSlippage) > profile.max_slippage_pips) {
      await emitRiskSlippageExceeded(
        userId,
        signal?.symbol || null,
        estimatedSlippage,
        profile.max_slippage_pips,
      );
      return this.fail(
        `Estimated slippage ${estimatedSlippage} pips exceeds limit of ${profile.max_slippage_pips}`,
        { estimatedSlippage, maxSlippagePips: profile.max_slippage_pips },
      );
    }

    return this.pass({
      estimatedSlippage,
      maxSlippagePips: profile.max_slippage_pips,
    });
  }
}
module.exports = SlippageCheck;
module.exports.SlippageCheck = SlippageCheck;
