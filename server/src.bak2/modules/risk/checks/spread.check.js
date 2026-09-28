/**
 * Spread Check
 *
 * @module signalforge/server/modules/risk/checks/spread
 */
const { BaseCheck } = require('./base.check.js');
const { RISK_CHECKS } = require('../risk.constants.js');
const { emitRiskSpreadTooWide } = require('../risk.events.js');

export class SpreadCheck extends BaseCheck {
  constructor() {
    super(RISK_CHECKS.SPREAD);
  }

  async run(context) {
    const { profile, userId, signal, currentSpread } = context;

    if (!profile || !profile.max_spread_pips || profile.max_spread_pips <= 0) {
      return this.pass();
    }

    if (currentSpread === undefined || currentSpread === null) {
      return this.skip('NO_SPREAD_DATA');
    }

    if (Number(currentSpread) > profile.max_spread_pips) {
      await emitRiskSpreadTooWide(
        userId,
        signal?.symbol || null,
        currentSpread,
        profile.max_spread_pips,
      );
      return this.fail(
        `Current spread ${currentSpread} pips exceeds limit of ${profile.max_spread_pips}`,
        { currentSpread, maxSpreadPips: profile.max_spread_pips },
      );
    }

    return this.pass({ currentSpread, maxSpreadPips: profile.max_spread_pips });
  }
}
module.exports = SpreadCheck;