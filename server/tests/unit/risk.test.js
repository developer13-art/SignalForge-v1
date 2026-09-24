/**
 * Risk Unit Tests
 *
 * @module server/tests/unit/risk.test
 */

import { describe, test, expect } from '@jest/globals';

function evaluateRisk({ maxDailyLoss, currentDailyLoss, riskPercent, balance, stopLossPips, pipValue }) {
  if (currentDailyLoss >= maxDailyLoss) {
    return { allowed: false, reason: 'MAX_DAILY_LOSS_REACHED' };
  }

  const riskAmount = (balance * riskPercent) / 100;
  const positionSize = riskAmount / (stopLossPips * pipValue);

  if (positionSize <= 0) {
    return { allowed: false, reason: 'INVALID_POSITION_SIZE' };
  }

  return { allowed: true, positionSize };
}

describe('Risk engine', () => {
  test('rejects when daily loss limit reached', () => {
    const result = evaluateRisk({
      maxDailyLoss: 500,
      currentDailyLoss: 500,
      riskPercent: 1,
      balance: 10000,
      stopLossPips: 20,
      pipValue: 10,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('MAX_DAILY_LOSS_REACHED');
  });

  test('allows and computes position size', () => {
    const result = evaluateRisk({
      maxDailyLoss: 500,
      currentDailyLoss: 100,
      riskPercent: 1,
      balance: 10000,
      stopLossPips: 20,
      pipValue: 10,
    });
    expect(result.allowed).toBe(true);
    expect(result.positionSize).toBeCloseTo(0.5);
  });
});