/**
 * Margin Check
 *
 * @module signalforge/server/modules/risk/checks/margin
 */

import { BaseCheck } from './base.check.js';
import { RISK_CHECKS } from '../risk.constants.js';
import { emitRiskMarginInsufficient } from '../risk.events.js';

export class MarginCheck extends BaseCheck {
  constructor() {
    super(RISK_CHECKS.MARGIN);
  }

  async run(context) {
    const { userId, accountSnapshot, requiredMargin } = context;

    if (!accountSnapshot) {
      return this.skip('NO_ACCOUNT_SNAPSHOT');
    }

    if (!requiredMargin || requiredMargin <= 0) {
      return this.pass();
    }

    const freeMargin = Number(accountSnapshot.free_margin || 0);

    if (freeMargin < requiredMargin) {
      await emitRiskMarginInsufficient(userId, requiredMargin, freeMargin);
      return this.fail(
        `Free margin ${freeMargin.toFixed(2)} is insufficient for required ${requiredMargin.toFixed(2)}`,
        { requiredMargin, freeMargin },
      );
    }

    return this.pass({
      requiredMargin,
      freeMargin,
      marginLevel: freeMargin / requiredMargin,
    });
  }
}

export default MarginCheck;