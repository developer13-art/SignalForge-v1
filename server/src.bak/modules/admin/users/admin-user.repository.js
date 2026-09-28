/**
 * Admin User Repository
 *
 * Persistence layer for administrative user management.
 *
 * @module server/modules/admin/users/admin-user.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function listUsers({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }

  if (filters.kycStatus) {
    params.push(filters.kycStatus);
    conditions.push(`kyc_status = $${params.length}`);
  }

  if (filters.email) {
    params.push(`%${filters.email.toLowerCase()}%`);
    conditions.push(`LOWER(email) LIKE $${params.length}`);
  }

  if (filters.from) {
    params.push(filters.from);
    conditions.push(`created_at >= $${params.length}`);
  }

  if (filters.to) {
    params.push(filters.to);
    conditions.push(`created_at <= $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT id, email, username, first_name, last_name, status, kyc_status, account_type,
            email_verified_at, last_login_at, created_at, updated_at
       FROM users
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM users ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function findUserById({ userId }) {
  const { rows } = await db.query(
    `SELECT * FROM users WHERE id = $1 LIMIT 1`,
    [userId],
  );
  return rows[0] || null;
}

export async function findUserByEmail({ email }) {
  const { rows } = await db.query(
    `SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [email],
  );
  return rows[0] || null;
}

export async function updateUserStatus({ userId, status }) {
  const { rowCount } = await db.query(
    `UPDATE users SET status = $1, updated_at = $2 WHERE id = $3`,
    [status, nowIso(), userId],
  );
  return rowCount > 0;
}

export async function updateUserKycStatus({ userId, kycStatus }) {
  const { rowCount } = await db.query(
    `UPDATE users SET kyc_status = $1, updated_at = $2 WHERE id = $3`,
    [kycStatus, nowIso(), userId],
  );
  return rowCount > 0;
}

export async function deleteUser({ userId }) {
  const { rowCount } = await db.query(
    `UPDATE users
        SET status = 'DEACTIVATED',
            email = CONCAT(email, '+deleted-', $1),
            deleted_at = $2,
            updated_at = $2
      WHERE id = $1`,
    [userId, nowIso()],
  );
  return rowCount > 0;
}

export async function listUserSessions({ userId }) {
  const { rows } = await db.query(
    `SELECT id, ip_address, user_agent, created_at, expires_at, revoked_at
       FROM user_sessions
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [userId],
  );
  return rows;
}

export async function revokeAllSessions({ userId }) {
  const { rowCount } = await db.query(
    `UPDATE user_sessions
        SET revoked_at = $1
      WHERE user_id = $2 AND revoked_at IS NULL`,
    [nowIso(), userId],
  );
  return rowCount;
}

export async function countUsersByStatus() {
  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count FROM users GROUP BY status`,
  );
  return rows;
}

export const adminUserRepository = {
  listUsers,
  findUserById,
  findUserByEmail,
  updateUserStatus,
  updateUserKycStatus,
  deleteUser,
  listUserSessions,
  revokeAllSessions,
  countUsersByStatus,
};