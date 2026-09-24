/**
 * Payment Unit Tests
 *
 * @module server/tests/unit/payment.test
 */

import { describe, test, expect } from '@jest/globals';
import { isSuccessfulPayment, isFinalPayment, PAYMENT_STATUSES } from '@signalforge/shared/constants/payment-statuses';

describe('Payment status helpers', () => {
  test('SUCCEEDED is successful and final', () => {
    expect(isSuccessfulPayment(PAYMENT_STATUSES.SUCCEEDED)).toBe(true);
    expect(isFinalPayment(PAYMENT_STATUSES.SUCCEEDED)).toBe(true);
  });

  test('PENDING is neither successful nor final', () => {
    expect(isSuccessfulPayment(PAYMENT_STATUSES.PENDING)).toBe(false);
    expect(isFinalPayment(PAYMENT_STATUSES.PENDING)).toBe(false);
  });
});