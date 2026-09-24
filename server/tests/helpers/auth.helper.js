/**
 * Auth Test Helper
 *
 * @module server/tests/helpers/auth.helper
 */

import { db } from '../../src/database';
import { hashPassword } from '../../src/utils/password.util';
import { signAccessToken } from '../../src/utils/jwt.util';
import { v4 as uuidv4 } from 'uuid';

export async function createTestUser({
  email = `test-${Date.now()}@signalforge.local`,
  password = 'TestPassword123!',
  status = 'ACTIVE',
  kycStatus = 'VERIFIED',
  emailVerified = true,
} = {}) {
  const hashed = await hashPassword(password);

  const { rows } = await db.query(
    `INSERT INTO users
       (email, password_hash, first_name, last_name, status, kyc_status, email_verified_at, created_at, updated_at)
     VALUES ($1, $2, 'Test', 'User', $3, $4, $5, NOW(), NOW())
     RETURNING *`,
    [email, hashed, status, kycStatus, emailVerified ? new Date().toISOString() : null],
  );

  return rows[0];
}

export function buildAccessToken(user) {
  return signAccessToken({
    sub: user.id,
    email: user.email,
  });
}

export async function createTestAdmin() {
  const user = await createTestUser({ email: `admin-${Date.now()}@signalforge.local` });

  const { rows: roleRows } = await db.query(
    `SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1`,
  );

  if (roleRows[0]) {
    await db.query(
      `INSERT INTO user_roles (user_id, role_id, granted_at) VALUES ($1, $2, NOW())
       ON CONFLICT DO NOTHING`,
      [user.id, roleRows[0].id],
    );
  }

  return { user, token: buildAccessToken(user) };
}

export async function cleanupTestUser(userId) {
  await db.query(`DELETE FROM users WHERE id = $1`, [userId]);
}

export function randomId() {
  return uuidv4();
}

export const authHelper = {
  createTestUser,
  buildAccessToken,
  createTestAdmin,
  cleanupTestUser,
  randomId,
};