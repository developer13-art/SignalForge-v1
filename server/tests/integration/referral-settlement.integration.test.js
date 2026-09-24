/**
 * Referral Settlement Integration Tests
 *
 * @module server/tests/integration/referral-settlement.integration.test
 */

import { describe, test, expect } from '@jest/globals';
import { calculateReferralReward } from '@signalforge/shared/schemas/referral-reward.schema';

describe('Referral settlement integration', () => {
  test('worked example matches specification', () => {
    const grossProfit = 4000;
    const grossLoss = -800;
    const eligibleCosts = 200;
    const eligibleNetProfit = Math.max(0, grossProfit + grossLoss - eligibleCosts);
    const rewardRate = 0.001;
    const rewardAmount = calculateReferralReward(eligibleNetProfit, rewardRate);

    expect(eligibleNetProfit).toBe(3000);
    expect(rewardAmount).toBeCloseTo(3);
  });

  test('losing month yields zero reward', () => {
    const eligibleNetProfit = Math.max(0, 500 - 1000 - 50);
    const rewardAmount = calculateReferralReward(eligibleNetProfit, 0.001);
    expect(rewardAmount).toBe(0);
  });
});