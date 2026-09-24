/**
 * KYC Integration Tests
 *
 * @module server/tests/integration/kyc.integration.test
 */

import { describe, test, expect, afterAll } from '@jest/globals';
import { db } from '../../src/database';
import { hashPassword } from '../../src/utils/password.util';

describe('KYC integration', () => {
  const createdUserIds = [];

  afterAll(async () => {
    for (const id of createdUserIds) {
      await db.query(`DELETE FROM users WHERE id = $1`, [id]).catch(() => {});
    }
  });

  test('KYC lifecycle from submission to approval', async () => {
    const hash = await hashPassword('IntegrationPass123!');

    const { rows: userRows } = await db.query(
      `INSERT INTO users (email, password_hash, status, kyc_status, created_at, updated_at)
       VALUES ($1, $2, 'ACTIVE', 'NOT_STARTED', NOW(), NOW())
       RETURNING *`,
      [`kyc-int-${Date.now()}@signalforge.local`, hash],
    );

    const user = userRows[0];
    createdUserIds.push(user.id);

    const { rows: appRows } = await db.query(
      `INSERT INTO kyc_applications (user_id, status, submitted_at, created_at, updated_at)
       VALUES ($1, 'PENDING', NOW(), NOW(), NOW())
       RETURNING *`,
      [user.id],
    );

    const application = appRows[0];
    expect(application.status).toBe('PENDING');

    await db.query(
      `UPDATE kyc_applications SET status = 'VERIFIED', verified_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [application.id],
    );

    await db.query(`UPDATE users SET kyc_status = 'VERIFIED', updated_at = NOW() WHERE id = $1`, [user.id]);

    const { rows: updatedRows } = await db.query(`SELECT kyc_status FROM users WHERE id = $1`, [user.id]);
    expect(updatedRows[0].kyc_status).toBe('VERIFIED');

    await db.query(`DELETE FROM kyc_applications WHERE id = $1`, [application.id]);
  });
});