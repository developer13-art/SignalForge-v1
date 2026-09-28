/**
 * Session Repository (User Module)
 *
 * @module signalforge/server/modules/users/sessions/repository
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';

export class SessionRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async listByUser(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, ip_address, user_agent, device_id, device_type,
              device_label, expires_at, revoked_at, created_at, last_used_at
         FROM user_sessions
        WHERE user_id = $1
          AND revoked_at IS NULL
          AND expires_at > NOW()
        ORDER BY last_used_at DESC NULLS LAST, created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async findById(sessionId, userId) {
    const result = await this.db.query(
      `SELECT id, user_id, ip_address, user_agent, device_id, device_type,
              device_label, expires_at, revoked_at, created_at, last_used_at
         FROM user_sessions
        WHERE id = $1 AND user_id = $2
        LIMIT 1`,
      [sessionId, userId],
    );
    return result.rows[0] || null;
  }

  async revoke(sessionId, userId, reason = 'user_action') {
    const result = await this.db.query(
      `UPDATE user_sessions
          SET revoked_at = NOW(),
              revocation_reason = $3
        WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL
        RETURNING id`,
      [sessionId, userId, reason],
    );
    return result.rowCount > 0;
  }

  async revokeAll(userId, exceptSessionId = null, reason = 'user_action') {
    if (exceptSessionId) {
      const result = await this.db.query(
        `UPDATE user_sessions
            SET revoked_at = NOW(),
                revocation_reason = $3
          WHERE user_id = $1
            AND id != $2
            AND revoked_at IS NULL
          RETURNING id`,
        [userId, exceptSessionId, reason],
      );
      return result.rowCount;
    }
    const result = await this.db.query(
      `UPDATE user_sessions
          SET revoked_at = NOW(),
              revocation_reason = $2
        WHERE user_id = $1
          AND revoked_at IS NULL
        RETURNING id`,
      [userId, reason],
    );
    return result.rowCount;
  }
}

export default SessionRepository;