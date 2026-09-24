/**
 * Automation Rules Unit Tests
 *
 * @module server/tests/unit/automation.test
 */

import { describe, test, expect } from '@jest/globals';

function evaluateRule({ rule, context }) {
  if (rule.condition.type === 'PROFIT_GREATER_THAN') {
    return context.profit > rule.condition.value;
  }
  if (rule.condition.type === 'CONFIDENCE_GREATER_OR_EQUAL') {
    return context.confidence >= rule.condition.value;
  }
  return false;
}

describe('Automation rule engine', () => {
  test('profit greater than rule matches', () => {
    const rule = { condition: { type: 'PROFIT_GREATER_THAN', value: 10 } };
    expect(evaluateRule({ rule, context: { profit: 15 } })).toBe(true);
    expect(evaluateRule({ rule, context: { profit: 5 } })).toBe(false);
  });

  test('confidence rule matches', () => {
    const rule = { condition: { type: 'CONFIDENCE_GREATER_OR_EQUAL', value: 0.8 } };
    expect(evaluateRule({ rule, context: { confidence: 0.9 } })).toBe(true);
    expect(evaluateRule({ rule, context: { confidence: 0.5 } })).toBe(false);
  });
});