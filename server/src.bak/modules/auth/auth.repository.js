/**
 * Auth Repository
 *
 * Provides direct database access for authentication-related tables:
 * users, user_sessions, two_factor_auth, api_keys, login_attempts,
 * email_verifications, phone_verifications, and password_resets.
 *
 * @module signalforge/server/modules/auth/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class AuthRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async findUserByEmail(email) {
    const result = await this.db.query(
      `SELECT id, email, phone, password_hash, first_name, last_name, username,
              avatar_url, status, kyc_status, account_type, email_verified_at,
              phone_verified_at, last_login_at, failed_login_attempts, locked_until,
              created_at, updated_at, deleted_at
         FROM users
        WHERE LOWER(email) = LOWER($1)
          AND deleted_at IS NULL
        LIMIT 1`,
      [email],
    );
    return result.rows[0] || null;
  }

  async findUserById(userId) {
    const result = await this.db.query(
      `SELECT id, email, phone, password_hash, first_name, last_name, username,
              avatar_url, status, kyc_status, account_type, email_verified_at,
              phone_verified_at, last_login_at, failed_login_attempts, locked_until,
              created_at, updated_at, deleted_at
         FROM users
        WHERE id = $1
        LIMIT 1`,
      [userId],
    );
    return result.rows[0] || null;
  }

  async findUserByUsername(username) {
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

  async findUserByPhone(phone) {
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

  async createUser(data) {
    const result = await this.db.query(
      `INSERT INTO users (
         email, phone, password_hash, first_name, middle_name, last_name,
         username, status, kyc_status, account_type, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING id, email, phone, first_name, last_name, username, status, kyc_status, account_type, created_at`,
      [
        data.email,
        data.phone || null,
        data.passwordHash,
        data.firstName || null,
        data.middleName || null,
        data.lastName || null,
        data.username || null,
        data.status || 'ACTIVE',
        data.kycStatus || 'NOT_STARTED',
        data.accountType || 'USER',
      ],
    );
    return result.rows[0];
  }

  async updateLastLogin(userId, ip) {
    await this.db.query(
      `UPDATE users
          SET last_login_at = NOW(),
              last_login_ip = $2,
              failed_login_attempts = 0,
              locked_until = NULL,
              updated_at = NOW()
        WHERE id = $1`,
      [userId, ip || null],
    );
  }

  async incrementFailedLoginAttempts(userId) {
    const result = await this.db.query(
      `UPDATE users
          SET failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1,
              updated_at = NOW()
        WHERE id = $1
        RETURNING failed_login_attempts`,
      [userId],
    );
    return result.rows[0]?.failed_login_attempts || 0;
  }

  async lockUserAccount(userId, until) {
    await this.db.query(
      `UPDATE users
          SET locked_until = $2,
              updated_at = NOW()
        WHERE id = $1`,
      [userId, until],
    );
  }

  async unlockUserAccount(userId) {
    await this.db.query(
      `UPDATE users
          SET locked_until = NULL,
              failed_login_attempts = 0,
              updated_at = NOW()
        WHERE id = $1`,
      [userId],
    );
  }

  async markEmailVerified(userId) {
    await this.db.query(
      `UPDATE users
          SET email_verified_at = NOW(),
              updated_at = NOW()
        WHERE id = $1`,
      [userId],
    );
  }

  async markPhoneVerified(userId) {
    await this.db.query(
      `UPDATE users
          SET phone_verified_at = NOW(),
              updated_at = NOW()
        WHERE id = $1`,
      [userId],
    );
  }

  async updatePassword(userId, passwordHash) {
    await this.db.query(
      `UPDATE users
          SET password_hash = $2,
              password_changed_at = NOW(),
              updated_at = NOW()
        WHERE id = $1`,
      [userId, passwordHash],
    );
  }

  async updateUserStatus(userId, status) {
    await this.db.query(
      `UPDATE users
          SET status = $2,
              updated_at = NOW()
        WHERE id = $1`,
      [userId, status],
    );
  }

  async createSession(data) {
    const result = await this.db.query(
      `INSERT INTO user_sessions (
         user_id, token_hash, refresh_token_hash, ip_address, user_agent,
         device_id, device_type, device_label, expires_at, created_at, last_used_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING id, user_id, expires_at, created_at`,
      [
        data.userId,
        data.tokenHash,
        data.refreshTokenHash,
        data.ipAddress || null,
        data.userAgent || null,
        data.deviceId || null,
        data.deviceType || 'UNKNOWN',
        data.deviceLabel || null,
        data.expiresAt,
      ],
    );
    return result.rows[0];
  }

  async findSessionByTokenHash(tokenHash) {
    const result = await this.db.query(
      `SELECT id, user_id, token_hash, refresh_token_hash, ip_address, user_agent,
              device_id, device_type, device_label, expires_at, revoked_at,
              created_at, last_used_at
         FROM user_sessions
        WHERE token_hash = $1
        LIMIT 1`,
      [tokenHash],
    );
    return result.rows[0] || null;
  }

  async findSessionByRefreshTokenHash(refreshTokenHash) {
    const result = await this.db.query(
      `SELECT id, user_id, token_hash, refresh_token_hash, ip_address, user_agent,
              device_id, device_type, device_label, expires_at, revoked_at,
              created_at, last_used_at
         FROM user_sessions
        WHERE refresh_token_hash = $1
        LIMIT 1`,
      [refreshTokenHash],
    );
    return result.rows[0] || null;
  }

  async findSessionById(sessionId) {
    const result = await this.db.query(
      `SELECT id, user_id, expires_at, revoked_at, last_used_at
         FROM user_sessions
        WHERE id = $1
        LIMIT 1`,
      [sessionId],
    );
    return result.rows[0] || null;
  }

  async touchSession(sessionId) {
    await this.db.query(
      `UPDATE user_sessions
          SET last_used_at = NOW()
        WHERE id = $1`,
      [sessionId],
    );
  }

  async revokeSession(sessionId) {
    await this.db.query(
      `UPDATE user_sessions
          SET revoked_at = NOW()
        WHERE id = $1 AND revoked_at IS NULL`,
      [sessionId],
    );
  }

  async revokeAllUserSessions(userId, exceptSessionId = null) {
    if (exceptSessionId) {
      await this.db.query(
        `UPDATE user_sessions
            SET revoked_at = NOW()
          WHERE user_id = $1
            AND revoked_at IS NULL
            AND id != $2`,
        [userId, exceptSessionId],
      );
    } else {
      await this.db.query(
        `UPDATE user_sessions
            SET revoked_at = NOW()
          WHERE user_id = $1
            AND revoked_at IS NULL`,
        [userId],
      );
    }
  }

  async listUserSessions(userId) {
    const result = await this.db.query(
      `SELECT id, ip_address, user_agent, device_id, device_type, device_label,
              expires_at, created_at, last_used_at
         FROM user_sessions
        WHERE user_id = $1
          AND revoked_at IS NULL
          AND expires_at > NOW()
        ORDER BY last_used_at DESC NULLS LAST, created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async findTwoFactorByUserId(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, method, secret, backup_codes, enabled, verified_at, created_at, updated_at
         FROM two_factor_auth
        WHERE user_id = $1
        LIMIT 1`,
      [userId],
    );
    return result.rows[0] || null;
  }

  async createTwoFactor(data) {
    const result = await this.db.query(
      `INSERT INTO two_factor_auth (
         user_id, method, secret, backup_codes, enabled, verified_at, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, user_id, method, enabled`,
      [
        data.userId,
        data.method,
        data.secret,
        data.backupCodes || [],
        data.enabled === true,
        data.verifiedAt || null,
      ],
    );
    return result.rows[0];
  }

  async updateTwoFactor(userId, data) {
    const fields = [];
    const values = [userId];
    let index = 2;

    if (data.secret !== undefined) {
      fields.push(`secret = $${index++}`);
      values.push(data.secret);
    }
    if (data.backupCodes !== undefined) {
      fields.push(`backup_codes = $${index++}`);
      values.push(data.backupCodes);
    }
    if (data.enabled !== undefined) {
      fields.push(`enabled = $${index++}`);
      values.push(data.enabled);
    }
    if (data.verifiedAt !== undefined) {
      fields.push(`verified_at = $${index++}`);
      values.push(data.verifiedAt);
    }

    if (fields.length === 0) {
      return;
    }

    fields.push('updated_at = NOW()');
    values.push(userId);

    await this.db.query(
      `UPDATE two_factor_auth
          SET ${fields.join(', ')}
        WHERE user_id = $1`,
      values,
    );
  }

  async deleteTwoFactor(userId) {
    await this.db.query(`DELETE FROM two_factor_auth WHERE user_id = $1`, [userId]);
  }

  async createVerificationToken(data) {
    const result = await this.db.query(
      `INSERT INTO verification_tokens (
         user_id, token_type, token_hash, target, expires_at, created_at
       ) VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id`,
      [
        data.userId,
        data.tokenType,
        data.tokenHash,
        data.target || null,
        data.expiresAt,
      ],
    );
    return result.rows[0];
  }

  async findVerificationToken(tokenHash, tokenType) {
    const result = await this.db.query(
      `SELECT id, user_id, token_type, token_hash, target, expires_at, used_at, created_at
         FROM verification_tokens
        WHERE token_hash = $1
          AND token_type = $2
          AND used_at IS NULL
          AND expires_at > NOW()
        LIMIT 1`,
      [tokenHash, tokenType],
    );
    return result.rows[0] || null;
  }

  async markVerificationTokenUsed(tokenId) {
    await this.db.query(
      `UPDATE verification_tokens
          SET used_at = NOW()
        WHERE id = $1`,
      [tokenId],
    );
  }

  async deleteExpiredVerificationTokens(userId, tokenType) {
    await this.db.query(
      `DELETE FROM verification_tokens
        WHERE user_id = $1
          AND token_type = $2
          AND (expires_at < NOW() OR used_at IS NOT NULL)`,
      [userId, tokenType],
    );
  }

  async createApiKey(data) {
    const result = await this.db.query(
      `INSERT INTO api_keys (
         user_id, name, prefix, hashed_key, permissions, ip_whitelist,
         expires_at, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id, name, prefix, created_at`,
      [
        data.userId,
        data.name,
        data.prefix,
        data.hashedKey,
        data.permissions || [],
        data.ipWhitelist || [],
        data.expiresAt || null,
      ],
    );
    return result.rows[0];
  }

  async findApiKeyByPrefix(prefix) {
    const result = await this.db.query(
      `SELECT id, user_id, name, prefix, hashed_key, permissions, ip_whitelist,
              expires_at, revoked_at, last_used_at, created_at
         FROM api_keys
        WHERE prefix = $1
        LIMIT 1`,
      [prefix],
    );
    return result.rows[0] || null;
  }

  async listApiKeys(userId) {
    const result = await this.db.query(
      `SELECT id, name, prefix, permissions, ip_whitelist, expires_at, revoked_at, last_used_at, created_at
         FROM api_keys
        WHERE user_id = $1
          AND revoked_at IS NULL
        ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async revokeApiKey(apiKeyId, userId) {
    await this.db.query(
      `UPDATE api_keys
          SET revoked_at = NOW()
        WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL`,
      [apiKeyId, userId],
    );
  }

  async touchApiKey(apiKeyId, ip) {
    await this.db.query(
      `UPDATE api_keys
          SET last_used_at = NOW(),
              last_used_ip = $2
        WHERE id = $1`,
      [apiKeyId, ip || null],
    );
  }

  async assignRoleToUser(userId, roleName) {
    await this.db.query(
      `INSERT INTO user_roles (user_id, role_id, assigned_at)
       SELECT $1, r.id, NOW()
         FROM roles r
        WHERE r.name = $2
       ON CONFLICT (user_id, role_id) DO NOTHING`,
      [userId, roleName],
    );
  }

  async getUserRoles(userId) {
    const result = await this.db.query(
      `SELECT r.name
         FROM user_roles ur
         JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = $1`,
      [userId],
    );
    return result.rows.map((row) => row.name);
  }

  async getUserPermissions(userId) {
    const result = await this.db.query(
      `SELECT DISTINCT p.name
         FROM user_roles ur
         JOIN role_permissions rp ON rp.role_id = ur.role_id
         JOIN permissions p ON p.id = rp.permission_id
        WHERE ur.user_id = $1`,
      [userId],
    );
    return result.rows.map((row) => row.name);
  }

  async logLoginAttempt(data) {
    await this.db.query(
      `INSERT INTO login_attempts (
         user_id, email, status, ip_address, user_agent, reason, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        data.userId || null,
        data.email,
        data.status,
        data.ipAddress || null,
        data.userAgent || null,
        data.reason || null,
      ],
    );
  }

  async countRecentFailedAttempts(email, windowMinutes) {
    const result = await this.db.query(
      `SELECT COUNT(*)::int AS count
         FROM login_attempts
        WHERE LOWER(email) = LOWER($1)
          AND status = 'FAILED'
          AND created_at > NOW() - ($2::int * interval '1 minute')`,
      [email, windowMinutes],
    );
    return result.rows[0]?.count || 0;
  }

  async cleanupExpiredSessions() {
    const result = await this.db.query(
      `DELETE FROM user_sessions
        WHERE expires_at < NOW()
           OR (revoked_at IS NOT NULL AND revoked_at < NOW() - interval '30 days')`,
    );
    return result.rowCount;
  }

  async cleanupExpiredVerificationTokens() {
    const result = await this.db.query(
      `DELETE FROM verification_tokens
        WHERE expires_at < NOW()
           OR used_at < NOW() - interval '7 days'`,
    );
    return result.rowCount;
  }
}

export default AuthRepository;