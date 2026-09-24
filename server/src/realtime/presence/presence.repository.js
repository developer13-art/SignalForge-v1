/**
 * Presence Repository
 *
 * Persists last-seen information for users. Used by the UI to display
 * who is online and to throttle presence broadcasts.
 *
 * @module server/realtime/presence/presence.repository
 */

import { db } from '../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function upsertPresence({ userId, status }) {
  const { rows } = await db.query(
    `INSERT INTO user_presence (user_id, status, last_seen_at, updated_at)
     VALUES ($1, $2, $3, $3)
     ON CONFLICT (user_id) DO UPDATE
       SET status = EXCLUDED.status,
           last_seen_at = EXCLUDED.last_seen_at,
           updated_at = EXCLUDED.updated_at
     RETURNING *`,
    [userId, status || 'online', nowIso()],
  );
  return rows[0];
}

export async function getPresence({ userId }) {
  const { rows } = await db.query(
    `SELECT * FROM user_presence WHERE user_id = $1 LIMIT 1`,
    [userId],
  );
  return rows[0] || null;
}

export async function listOnlineUsers({ limit = 100 }) {
  const { rows } = await db.query(
    `SELECT user_id, status, last_seen_at
       FROM user_presence
      WHERE status = 'online'
        AND last_seen_at > NOW() - INTERVAL '2 minutes'
      ORDER BY last_seen_at DESC
      LIMIT $1`,
    [limit],
  );
  return rows;
}

export async function deletePresence({ userId }) {
  const { rowCount } = await db.query(
    `DELETE FROM user_presence WHERE user_id = $1`,
    [userId],
  );
  return rowCount > 0;
}

export const presenceRepository = {
  upsertPresence,
  getPresence,
  listOnlineUsers,
  deletePresence,
};