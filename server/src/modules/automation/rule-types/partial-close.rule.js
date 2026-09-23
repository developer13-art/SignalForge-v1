/**
 * Partial Close Rule
 *
 * @module signalforge/server/modules/automation/rule-types/partial-close
 */

import { AUTOMATION_CONDITION_TYPES, AUTOMATION_ACTION_TYPES } from '../automation.constants.js';

export class PartialCloseRule {
  static supports(condition) {
    return [
      AUTOMATION_CONDITION_TYPES.PROFIT_GREATER_THAN,
      AUTOMATION_CONDITION_TYPES.PROFIT_PERCENT_GREATER_THAN,
    ].includes(condition?.type);
  }

  static defaultActions() {
    return [AUTOMATION_ACTION_TYPES.PARTIAL_CLOSE];
  }
}

export default PartialCloseRule;