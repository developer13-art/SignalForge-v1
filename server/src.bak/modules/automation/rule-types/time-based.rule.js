/**
 * Time-Based Rule
 *
 * @module signalforge/server/modules/automation/rule-types/time-based
 */

import { AUTOMATION_CONDITION_TYPES, AUTOMATION_ACTION_TYPES } from '../automation.constants.js';

export class TimeBasedRule {
  static supports(condition) {
    return [
      AUTOMATION_CONDITION_TYPES.TIME_AFTER,
      AUTOMATION_CONDITION_TYPES.TIME_BEFORE,
      AUTOMATION_CONDITION_TYPES.TRADE_DURATION_GREATER_THAN,
      AUTOMATION_CONDITION_TYPES.SESSION_IS,
    ].includes(condition?.type);
  }

  static defaultActions() {
    return [AUTOMATION_ACTION_TYPES.CLOSE_POSITION];
  }
}

export default TimeBasedRule;