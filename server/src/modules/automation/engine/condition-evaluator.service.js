/**
 * Condition Evaluator Service
 *
 * @module signalforge/server/modules/automation/engine/condition-evaluator
 */

import { AUTOMATION_CONDITION_TYPES } from '../automation.constants.js';
import { UnsupportedConditionError } from '../automation.errors.js';

export class ConditionEvaluatorService {
  async evaluate(condition, context) {
    if (!condition || typeof condition !== 'object') {
      return { matched: false, reason: 'INVALID_CONDITION' };
    }

    const { type } = condition;

    switch (type) {
      case AUTOMATION_CONDITION_TYPES.PROFIT_GREATER_THAN:
        return this.compare(context.profit, condition.value, '>');

      case AUTOMATION_CONDITION_TYPES.PROFIT_LESS_THAN:
        return this.compare(context.profit, condition.value, '<');

      case AUTOMATION_CONDITION_TYPES.PROFIT_PERCENT_GREATER_THAN:
        return this.compare(context.profitPercent, condition.value, '>');

      case AUTOMATION_CONDITION_TYPES.CONFIDENCE_GREATER_OR_EQUAL:
        return this.compare(context.confidence, condition.value, '>=');

      case AUTOMATION_CONDITION_TYPES.CONFIDENCE_LESS_THAN:
        return this.compare(context.confidence, condition.value, '<');

      case AUTOMATION_CONDITION_TYPES.PROVIDER_IS:
        return this.equals(context.providerId, condition.value);

      case AUTOMATION_CONDITION_TYPES.PROVIDER_CLOSES:
        return { matched: context.providerClosed === true, reason: 'PROVIDER_CLOSE' };

      case AUTOMATION_CONDITION_TYPES.SYMBOL_IS:
        return this.equals(context.symbol, condition.value);

      case AUTOMATION_CONDITION_TYPES.SYMBOL_IN: {
        const symbols = Array.isArray(condition.value) ? condition.value : [condition.value];
        return {
          matched: symbols.includes(context.symbol),
          reason: 'SYMBOL_IN',
        };
      }

      case AUTOMATION_CONDITION_TYPES.DIRECTION_IS:
        return this.equals(context.direction, condition.value);

      case AUTOMATION_CONDITION_TYPES.SESSION_IS:
        return this.equals(context.session, condition.value);

      case AUTOMATION_CONDITION_TYPES.TIME_AFTER:
        return this.timeCompare(context.currentTime, condition.value, 'after');

      case AUTOMATION_CONDITION_TYPES.TIME_BEFORE:
        return this.timeCompare(context.currentTime, condition.value, 'before');

      case AUTOMATION_CONDITION_TYPES.DRAWDOWN_GREATER_THAN:
        return this.compare(context.drawdownPercent, condition.value, '>');

      case AUTOMATION_CONDITION_TYPES.OPEN_TRADES_GREATER_THAN:
        return this.compare(context.openTradesCount, condition.value, '>');

      case AUTOMATION_CONDITION_TYPES.TRADE_DURATION_GREATER_THAN:
        return this.compare(context.tradeDurationMinutes, condition.value, '>');

      case AUTOMATION_CONDITION_TYPES.RISK_PERCENT_GREATER_THAN:
        return this.compare(context.riskPercent, condition.value, '>');

      default:
        throw new UnsupportedConditionError(undefined, { type });
    }
  }

  compare(actual, expected, operator) {
    const a = Number(actual);
    const b = Number(expected);
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      return { matched: false, reason: 'INVALID_NUMBERS' };
    }
    switch (operator) {
      case '>':
        return { matched: a > b, reason: 'GT' };
      case '>=':
        return { matched: a >= b, reason: 'GTE' };
      case '<':
        return { matched: a < b, reason: 'LT' };
      case '<=':
        return { matched: a <= b, reason: 'LTE' };
      default:
        return { matched: false, reason: 'UNKNOWN_OPERATOR' };
    }
  }

  equals(actual, expected) {
    if (actual === undefined || actual === null) {
      return { matched: false, reason: 'MISSING_VALUE' };
    }
    return {
      matched: String(actual) === String(expected),
      reason: 'EQUALS',
    };
  }

  timeCompare(actual, expected, direction) {
    if (!actual || !expected) {
      return { matched: false, reason: 'MISSING_TIME' };
    }
    const actualDate = new Date(actual);
    const expectedDate = new Date(expected);
    if (Number.isNaN(actualDate.getTime()) || Number.isNaN(expectedDate.getTime())) {
      return { matched: false, reason: 'INVALID_TIME' };
    }
    if (direction === 'after') {
      return { matched: actualDate.getTime() > expectedDate.getTime(), reason: 'AFTER' };
    }
    return { matched: actualDate.getTime() < expectedDate.getTime(), reason: 'BEFORE' };
  }
}

export default ConditionEvaluatorService;