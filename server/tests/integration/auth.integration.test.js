/**
 * Auth Integration Tests
 *
 * @module server/tests/integration/auth.integration.test
 */

import { describe, test, expect, afterAll } from '@jest/globals';
import { db } from '../../src/database';
import { hashPassword, verifyPassword } from '../../src/utils/password.util';
import { signAccessToken, verifyAccessToken } from '../../src/utils/jwt.util';
import { dbHelper } from '../helpers/db.helper';

describe('Auth integration', () => {
  const createdUserIds = [];

  afterAll(async () => {
    for (const id of createdUserIds) {
      await db.query(`DELETE FROM users WHERE id = $1`, [id]).catch(() => {});
    }
  });

  test('full registration, hashing, and token flow', async () => {
    const password = 'IntegrationPass123!';
    const hash = await hashPassword(password);

    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, status, kyc_status, created_at, updated_at)
       VALUES ($1, $2, 'ACTIVE', 'NOT_STARTED', NOW(), NOW())
       RETURNING *`,
      [`integration-${Date.now()}@signalforge.local`, hash],
    );

    const user = rows[0];
    createdUserIds.push(user.id);

    const passwordValid = await verifyPassword(password, user.password_hash);
    expect(passwordValid).toBe(true);

    const token = signAccessToken({ sub: user.id, email: user.email });
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe(user.id);
  });

  test('table truncation helper works', async () => {
    const count = await dbHelper.countRows('users');
    expect(typeof count).toBe('number');
  });
});