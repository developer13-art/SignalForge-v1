/**
 * Profit Lock Rule
 *
 * @module signalforge/server/modules/automation/rule-types/profit-lock
 */
const { AUTOMATION_CONDITION_TYPES, AUTOMATION_ACTION_TYPES } = require('../automation.constants.js');

export class ProfitLockRule {
  static supports(condition) {
    return [
      AUTOMATION_CONDITION_TYPES.PROFIT_GREATER_THAN,
      AUTOMATION_CONDITION_TYPES.PROFIT_PERCENT_GREATER_THAN,
    ].includes(condition?.type);
  }

  static defaultActions() {
    return [AUTOMATION_ACTION_TYPES.LOCK_PROFIT];
  }
}
module.exports = ProfitLockRule;