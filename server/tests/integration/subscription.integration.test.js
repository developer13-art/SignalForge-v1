/**
 * Subscription Integration Tests
 *
 * @module server/tests/integration/subscription.integration.test
 */

import { describe, test, expect, afterAll } from '@jest/globals';
import { db } from '../../src/database';
import { hashPassword } from '../../src/utils/password.util';
import { canExecuteTrades, SUBSCRIPTION_STATUSES } from '@signalforge/shared/constants/subscription-statuses';

describe('Subscription integration', () => {
  const createdUserIds = [];

  afterAll(async () => {
    for (const id of createdUserIds) {
      await db.query(`DELETE FROM users WHERE id = $1`, [id]).catch(() => {});
    }
  });

  test('expired subscription disables trading', async () => {
    const hash = await hashPassword('IntegrationPass123!');

    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, status, kyc_status, created_at, updated_at)
       VALUES ($1, $2, 'ACTIVE', 'VERIFIED', NOW(), NOW())
       RETURNING *`,
      [`sub-int-${Date.now()}@signalforge.local`, hash],
    );

    const user = rows[0];
    createdUserIds.push(user.id);

    const { rows: subRows } = await db.query(
      `INSERT INTO subscriptions (user_id, plan_code, status, current_period_start, created_at, updated_at)
       VALUES ($1, 'MONTHLY', 'EXPIRED', NOW(), NOW(), NOW())
       RETURNING *`,
      [user.id],
    );

    expect(canExecuteTrades(subRows[0].status)).toBe(false);

    await db.query(`DELETE FROM subscriptions WHERE id = $1`, [subRows[0].id]);
  });
});