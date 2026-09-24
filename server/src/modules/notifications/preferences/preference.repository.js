/**
 * Preference Repository
 *
 * Persistence layer for notification preferences.
 *
 * @module server/modules/notifications/preferences/preference.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function findByUserId({ userId }) {
  const { rows } = await db.query(
    `SELECT * FROM notification_preferences WHERE user_id = $1 LIMIT 1`,
    [userId],
  );
  return rows[0] || null;
}

export async function upsertPreferences({
  userId,
  channels,
  mutedCategories,
  quietHoursStart,
  quietHoursEnd,
  timezone,
}) {
  const { rows } = await db.query(
    `INSERT INTO notification_preferences
       (user_id, channels, muted_categories, quiet_hours_start, quiet_hours_end, timezone, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     ON CONFLICT (user_id) DO UPDATE
       SET channels = EXCLUDED.channels,
           muted_categories = EXCLUDED.muted_categories,
           quiet_hours_start = EXCLUDED.quiet_hours_start,
           quiet_hours_end = EXCLUDED.quiet_hours_end,
           timezone = EXCLUDED.timezone,
           updated_at = EXCLUDED.updated_at
     RETURNING *`,
    [
      userId,
      JSON.stringify(channels || []),
      JSON.stringify(mutedCategories || []),
      quietHoursStart || null,
      quietHoursEnd || null,
      timezone || 'UTC',
      nowIso(),
    ],
  );
  return rows[0];
}

export async function deleteByUserId({ userId }) {
  const { rowCount } = await db.query(
    `DELETE FROM notification_preferences WHERE user_id = $1`,
    [userId],
  );
  return rowCount > 0;
}

export const preferenceRepository = {
  findByUserId,
  upsertPreferences,
  deleteByUserId,
};