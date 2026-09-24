/**
 * Preference Service
 *
 * Manages user notification preferences including enabled channels,
 * muted categories, and quiet hours. Falls back to defaults when no
 * preferences exist.
 *
 * @module server/modules/notifications/preferences/preference.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';
import { DEFAULT_ENABLED_CHANNELS } from '@signalforge/shared/constants/notification-channels';

const DEFAULT_PREFERENCES = Object.freeze({
  channels: [...DEFAULT_ENABLED_CHANNELS],
  mutedCategories: [],
  quietHoursStart: null,
  quietHoursEnd: null,
  timezone: 'UTC',
});

export async function getPreferences({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT channels, muted_categories, quiet_hours_start, quiet_hours_end, timezone
       FROM notification_preferences
      WHERE user_id = $1
      LIMIT 1`,
    [userId],
  );

  const row = rows[0];

  if (!row) {
    return { ...DEFAULT_PREFERENCES };
  }

  return {
    channels: row.channels ? (typeof row.channels === 'string' ? JSON.parse(row.channels) : row.channels) : [...DEFAULT_ENABLED_CHANNELS],
    mutedCategories: row.muted_categories
      ? (typeof row.muted_categories === 'string' ? JSON.parse(row.muted_categories) : row.muted_categories)
      : [],
    quietHoursStart: row.quiet_hours_start,
    quietHoursEnd: row.quiet_hours_end,
    timezone: row.timezone || 'UTC',
  };
}

export async function updatePreferences({ userId, payload }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const current = await getPreferences({ userId });

  const channels = payload.channels !== undefined ? payload.channels : current.channels;
  const mutedCategories = payload.mutedCategories !== undefined ? payload.mutedCategories : current.mutedCategories;
  const quietHoursStart = payload.quietHoursStart !== undefined ? payload.quietHoursStart : current.quietHoursStart;
  const quietHoursEnd = payload.quietHoursEnd !== undefined ? payload.quietHoursEnd : current.quietHoursEnd;
  const timezone = payload.timezone !== undefined ? payload.timezone : current.timezone;

  await db.query(
    `INSERT INTO notification_preferences
       (user_id, channels, muted_categories, quiet_hours_start, quiet_hours_end, timezone, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     ON CONFLICT (user_id) DO UPDATE
       SET channels = EXCLUDED.channels,
           muted_categories = EXCLUDED.muted_categories,
           quiet_hours_start = EXCLUDED.quiet_hours_start,
           quiet_hours_end = EXCLUDED.quiet_hours_end,
           timezone = EXCLUDED.timezone,
           updated_at = EXCLUDED.updated_at`,
    [
      userId,
      JSON.stringify(channels),
      JSON.stringify(mutedCategories),
      quietHoursStart,
      quietHoursEnd,
      timezone,
      nowIso(),
    ],
  );

  logger.debug({ userId }, 'Notification preferences persisted');

  return {
    channels,
    mutedCategories,
    quietHoursStart,
    quietHoursEnd,
    timezone,
  };
}

export async function resetPreferences({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  await db.query(`DELETE FROM notification_preferences WHERE user_id = $1`, [userId]);

  return { ...DEFAULT_PREFERENCES };
}

export const preferenceService = {
  getPreferences,
  updatePreferences,
  resetPreferences,
  DEFAULT_PREFERENCES,
};