/**
 * Break Even Rule
 *
 * @module signalforge/server/modules/automation/rule-types/break-even
 */

import { AUTOMATION_CONDITION_TYPES, AUTOMATION_ACTION_TYPES } from '../automation.constants.js';

export class BreakEvenRule {
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

export default BreakEvenRule;