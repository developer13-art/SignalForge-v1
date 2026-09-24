/**
 * Referral Unit Tests
 *
 * @module server/tests/unit/referral.test
 */

import { describe, test, expect } from '@jest/globals';
import { calculateReferralReward } from '@signalforge/shared/schemas/referral-reward.schema';

describe('Referral reward calculation', () => {
  test('calculates reward based on eligible net profit', () => {
    const reward = calculateReferralReward(3000, 0.001);
    expect(reward).toBeCloseTo(3);
  });

  test('floors at 0 for negative or zero profit', () => {
    expect(calculateReferralReward(-500, 0.001)).toBe(0);
    expect(calculateReferralReward(0, 0.001)).toBe(0);
  });
});