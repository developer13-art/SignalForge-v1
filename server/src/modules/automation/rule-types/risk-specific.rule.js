/**
 * Risk-Specific Rule
 *
 * @module signalforge/server/modules/automation/rule-types/risk-specific
 */

import { AUTOMATION_CONDITION_TYPES, AUTOMATION_ACTION_TYPES } from '../automation.constants.js';

export class RiskSpecificRule {
  static supports(condition) {
    return [
      AUTOMATION_CONDITION_TYPES.DRAWDOWN_GREATER_THAN,
      AUTOMATION_CONDITION_TYPES.OPEN_TRADES_GREATER_THAN,
      AUTOMATION_CONDITION_TYPES.RISK_PERCENT_GREATER_THAN,
    ].includes(condition?.type);
  }

  static defaultActions() {
    return [AUTOMATION_ACTION_TYPES.SKIP_SIGNAL];
  }
}

export default RiskSpecificRule;