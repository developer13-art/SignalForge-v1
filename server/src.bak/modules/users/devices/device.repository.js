/**
 * Device Repository (User Module)
 *
 * @module signalforge/server/modules/users/devices/repository
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';

export class DeviceRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async listByUser(userId) {
    const result = await this.db.query(
      `SELECT device_id, device_type, device_label,
              MAX(ip_address) AS ip_address,
              MAX(user_agent) AS user_agent,
              MAX(last_used_at) AS last_used_at,
              MIN(created_at) AS first_seen_at,
              COUNT(*)::int AS session_count
         FROM user_sessions
        WHERE user_id = $1
          AND revoked_at IS NULL
          AND expires_at > NOW()
        GROUP BY device_id, device_type, device_label
        ORDER BY MAX(last_used_at) DESC NULLS LAST`,
      [userId],
    );
    return result.rows;
  }

  async removeDevice(userId, deviceId) {
    const result = await this.db.query(
      `UPDATE user_sessions
          SET revoked_at = NOW(),
              revocation_reason = 'device_removed'
        WHERE user_id = $1
          AND device_id = $2
          AND revoked_at IS NULL
        RETURNING id`,
      [userId, deviceId],
    );
    return result.rowCount;
  }
}

export default DeviceRepository;