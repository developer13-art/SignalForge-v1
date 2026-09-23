/**
 * Trailing Stop Rule
 *
 * @module signalforge/server/modules/automation/rule-types/trailing
 */

import { AUTOMATION_CONDITION_TYPES, AUTOMATION_ACTION_TYPES } from '../automation.constants.js';

export class TrailingRule {
  static supports(condition) {
    return [
      AUTOMATION_CONDITION_TYPES.PROFIT_GREATER_THAN,
      AUTOMATION_CONDITION_TYPES.PROFIT_PERCENT_GREATER_THAN,
    ].includes(condition?.type);
  }

  static defaultActions() {
    return [AUTOMATION_ACTION_TYPES.TRAILING_STOP_ENABLE];
  }
}

export default TrailingRule;