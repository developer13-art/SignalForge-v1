/**
 * Subscription Unit Tests
 *
 * @module server/tests/unit/subscription.test
 */

import { describe, test, expect } from '@jest/globals';
import { canExecuteTrades, canAccessPlatform, SUBSCRIPTION_STATUSES } from '@signalforge/shared/constants/subscription-statuses';

describe('Subscription status behaviour', () => {
  test('ACTIVE can trade and access platform', () => {
    expect(canExecuteTrades(SUBSCRIPTION_STATUSES.ACTIVE)).toBe(true);
    expect(canAccessPlatform(SUBSCRIPTION_STATUSES.ACTIVE)).toBe(true);
  });

  test('EXPIRED can access but not trade', () => {
    expect(canExecuteTrades(SUBSCRIPTION_STATUSES.EXPIRED)).toBe(false);
    expect(canAccessPlatform(SUBSCRIPTION_STATUSES.EXPIRED)).toBe(true);
  });

  test('CANCELLED cannot access or trade', () => {
    expect(canExecuteTrades(SUBSCRIPTION_STATUSES.CANCELLED)).toBe(false);
    expect(canAccessPlatform(SUBSCRIPTION_STATUSES.CANCELLED)).toBe(false);
  });
});