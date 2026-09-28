/**
 * Break Even Rule
 *
 * @module signalforge/server/modules/automation/rule-types/break-even
 */
const { AUTOMATION_CONDITION_TYPES, AUTOMATION_ACTION_TYPES } = require('../automation.constants.js');
class BreakEvenRule {
  static supports(condition) {
    return [
      AUTOMATION_CONDITION_TYPES.PROFIT_GREATER_THAN,
      AUTOMATION_CONDITION_TYPES.PROFIT_PERCENT_GREATER_THAN,
    ].includes(condition?.type);
  }

  static defaultActions() {
    return [AUTOMATION_ACTION_TYPES.MOVE_STOP_LOSS_TO_BREAK_EVEN];
  }
}
module.exports = BreakEvenRule;
module.exports.BreakEvenRule = BreakEvenRule;
