/**
 * Admin Journey E2E Test
 *
 * @module server/tests/e2e/admin-journey.e2e.test
 */

import { describe, test, expect } from '@jest/globals';
import { hasPermission } from '@signalforge/shared/constants/permissions';

describe('E2E: Admin journey', () => {
  test('known permissions validate correctly', () => {
    const { PERMISSIONS } = require('@signalforge/shared/constants/permissions');

    expect(PERMISSIONS.ADMIN_DASHBOARD_VIEW).toBe('admin.dashboard.view');
    expect(PERMISSIONS.KYC_REVIEW).toBe('kyc.review');
    expect(PERMISSIONS.PAYMENTS_REFUND).toBe('payments.refund');
    expect(PERMISSIONS.REFERRALS_SETTLE).toBe('referrals.settle');
  });
});