/**
 * User Repository
 *
 * @module signalforge/server/modules/users/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class UserRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async findById(userId) {
    const result = await this.db.query(
      `SELECT id, email, phone, first_name, middle_name, last_name, username,
              avatar_url, status, kyc_status, account_type,
              email_verified_at, phone_verified_at, last_login_at, last_login_ip,
              password_changed_at, created_at, updated_at, deleted_at
         FROM users
        WHERE id = $1
        LIMIT 1`,
      [userId],
    );
    return result.rows[0] || null;
  }

  async findByIdWithRoles(userId) {
    const result = await this.db.query(
      `SELECT u.id, u.email, u.phone, u.first_name, u.middle_name, u.last_name,
              u.username, u.avatar_url, u.status, u.kyc_status, u.account_type,
              u.email_verified_at, u.phone_verified_at, u.last_login_at,
              u.created_at, u.updated_at,
              COALESCE(array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
         FROM users u
         LEFT JOIN user_roles ur ON ur.user_id = u.id
         LEFT JOIN roles r ON r.id = ur.role_id
        WHERE u.id = $1 AND u.deleted_at IS NULL
        GROUP BY u.id
        LIMIT 1`,
      [userId],
    );
    return result.rows[0] || null;
  }

  async findByEmail(email) {
    const result = await this.db.query(
      `SELECT id, email, phone, first_name, last_name, username, avatar_url,
              status, kyc_status, account_type, email_verified_at, phone_verified_at,
              created_at, updated_at, deleted_at
         FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1`,
      [email],
    );
    return result.rows[0] || null;
  }

  async findByUsername(username) {
    const result = await this.db.query(
      `SELECT id, email, username, status
         FROM users
        WHERE LOWER(username) = LOWER($1)
          AND deleted_at IS NULL
        LIMIT 1`,
      [username],
    );
    return result.rows[0] || null;
  }

  async findByPhone(phone) {
    const result = await this.db.query(
      `SELECT id, email, phone, status
         FROM users
        WHERE phone = $1
          AND deleted_at IS NULL
        LIMIT 1`,
      [phone],
    );
    return result.rows[0] || null;
  }

  async list(filters = {}, pagination = {}) {
    const conditions = ['u.deleted_at IS NULL'];
    const values = [];
    let index = 1;

    if (filters.status) {
      conditions.push(`u.status = $${index++}`);
      values.push(filters.status);
    }

    if (filters.kycStatus) {
      conditions.push(`u.kyc_status = $${index++}`);
      values.push(filters.kycStatus);
    }

    if (filters.accountType) {
      conditions.push(`u.account_type = $${index++}`);
      values.push(filters.accountType);
    }

    if (filters.search) {
      conditions.push(
        `(u.email ILIKE $${index} OR u.username ILIKE $${index} OR u.first_name ILIKE $${index} OR u.last_name ILIKE $${index})`,
      );
      values.push(`%${filters.search}%`);
      index++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM users u ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT u.id, u.email, u.phone, u.first_name, u.last_name, u.username,
              u.avatar_url, u.status, u.kyc_status, u.account_type,
              u.email_verified_at, u.phone_verified_at, u.last_login_at,
              u.created_at, u.updated_at
         FROM users u
         ${where}
         ORDER BY u.created_at DESC
         LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return {
      users: result.rows,
      total,
      limit,
      offset,
    };
  }

  async update(userId, data) {
    const fields = [];
    const values = [userId];
    let index = 2;

    const allowedFields = {
      firstName: 'first_name',
      middleName: 'middle_name',
      lastName: 'last_name',
      username: 'username',
      phone: 'phone',
      avatarUrl: 'avatar_url',
      status: 'status',
      accountType: 'account_type',
    };

    for (const [key, column] of Object.entries(allowedFields)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return this.findById(userId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE users
          SET ${fields.join(', ')}
        WHERE id = $1 AND deleted_at IS NULL`,
      values,
    );

    return this.findById(userId);
  }

  async softDelete(userId) {
    await this.db.query(
      `UPDATE users
          SET deleted_at = NOW(),
              status = 'DEACTIVATED',
              updated_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL`,
      [userId],
    );
  }

  async hardDelete(userId) {
    await this.db.query(`DELETE FROM users WHERE id = $1`, [userId]);
  }

  async deactivate(userId) {
    await this.db.query(
      `UPDATE users
          SET status = 'DEACTIVATED',
              updated_at = NOW()
        WHERE id = $1 AND status != 'DEACTIVATED'`,
      [userId],
    );
  }

  async reactivate(userId) {
    await this.db.query(
      `UPDATE users
          SET status = 'ACTIVE',
              updated_at = NOW()
        WHERE id = $1 AND status = 'DEACTIVATED'`,
      [userId],
    );
  }

  async countTotal(filters = {}) {
    const conditions = ['deleted_at IS NULL'];
    const values = [];
    let index = 1;

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    if (filters.kycStatus) {
      conditions.push(`kyc_status = $${index++}`);
      values.push(filters.kycStatus);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM users ${where}`,
      values,
    );
    return result.rows[0]?.total || 0;
  }

  async countByStatus() {
    const result = await this.db.query(
      `SELECT status, COUNT(*)::int AS count
         FROM users
        WHERE deleted_at IS NULL
        GROUP BY status`,
    );
    return result.rows;
  }

  async countByKycStatus() {
    const result = await this.db.query(
      `SELECT kyc_status, COUNT(*)::int AS count
         FROM users
        WHERE deleted_at IS NULL
        GROUP BY kyc_status`,
    );
    return result.rows;
  }

  async existsByEmail(email, excludeUserId = null) {
    const params = [email];
    let query = `SELECT 1 FROM users WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL`;
    if (excludeUserId) {
      query += ` AND id != $2`;
      params.push(excludeUserId);
    }
    query += ` LIMIT 1`;
    const result = await this.db.query(query, params);
    return result.rowCount > 0;
  }

  async existsByUsername(username, excludeUserId = null) {
    const params = [username];
    let query = `SELECT 1 FROM users WHERE LOWER(username) = LOWER($1) AND deleted_at IS NULL`;
    if (excludeUserId) {
      query += ` AND id != $2`;
      params.push(excludeUserId);
    }
    query += ` LIMIT 1`;
    const result = await this.db.query(query, params);
    return result.rowCount > 0;
  }

  async existsByPhone(phone, excludeUserId = null) {
    const params = [phone];
    let query = `SELECT 1 FROM users WHERE phone = $1 AND deleted_at IS NULL`;
    if (excludeUserId) {
      query += ` AND id != $2`;
      params.push(excludeUserId);
    }
    query += ` LIMIT 1`;
    const result = await this.db.query(query, params);
    return result.rowCount > 0;
  }
}

export default UserRepository;