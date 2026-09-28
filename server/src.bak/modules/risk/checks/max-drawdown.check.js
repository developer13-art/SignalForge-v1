/**
 * Max Drawdown Check
 *
 * @module signalforge/server/modules/risk/checks/max-drawdown
 */

import { BaseCheck } from './base.check.js';
import { RISK_CHECKS } from '../risk.constants.js';
import { emitRiskDrawdownExceeded } from '../risk.events.js';

export class MaxDrawdownCheck extends BaseCheck {
  constructor() {
    super(RISK_CHECKS.MAX_DRAWDOWN);
  }

  async run(context) {
    const { userId, profile, accountSnapshot } = context;

    if (!profile) {
      return this.skip('NO_PROFILE');
    }

    if (!profile.max_drawdown_percent || profile.max_drawdown_percent <= 0) {
      return this.pass();
    }

    if (!accountSnapshot) {
      return this.skip('NO_ACCOUNT_SNAPSHOT');
    }

    const balance = Number(accountSnapshot.balance || 0);
    const equity = Number(accountSnapshot.equity || 0);

    if (balance <= 0) {
      return this.pass();
    }

    const drawdownPercent = ((balance - equity) / balance) * 100;

    if (drawdownPercent >= profile.max_drawdown_percent) {
      await emitRiskDrawdownExceeded(userId, drawdownPercent, profile.max_drawdown_percent);
      return this.fail(
        `Drawdown ${drawdownPercent.toFixed(2)}% exceeds limit of ${profile.max_drawdown_percent}%`,
        { drawdownPercent, maxDrawdownPercent: profile.max_drawdown_percent },
      );
    }

    return this.pass({
      drawdownPercent,
      maxDrawdownPercent: profile.max_drawdown_percent,
    });
  }
}

export default MaxDrawdownCheck;