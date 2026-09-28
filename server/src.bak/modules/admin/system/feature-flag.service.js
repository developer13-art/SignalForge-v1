/**
 * Feature Flag Service
 *
 * Manages feature flags stored in the system_settings table under
 * the `feature_flags.*` namespace. Provides typed boolean reads and
 * writes and invalidates the settings cache when flags change.
 *
 * @module server/modules/admin/system/feature-flag.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { systemSettingsService } from './system-settings.service';

const FLAG_PREFIX = 'feature_flags.';

function buildKey(flagName) {
  return `${FLAG_PREFIX}${flagName}`;
}

export async function isFlagEnabled({ flagName, defaultValue = false }) {
  if (!flagName) {
    throw new AppError('flagName is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const value = await systemSettingsService.getSetting({
    key: buildKey(flagName),
    defaultValue,
  });

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value === 'true' || value === '1';
  }

  return Boolean(value);
}

export async function setFlag({ flagName, enabled, actorId, description }) {
  if (!flagName) {
    throw new AppError('flagName is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  await systemSettingsService.setSetting({
    key: buildKey(flagName),
    value: Boolean(enabled),
    valueType: 'boolean',
    category: 'feature_flags',
    description: description || null,
    isPublic: false,
    actorId,
  });

  logger.info({ flagName, enabled, actorId }, 'Feature flag updated');

  return { flagName, enabled: Boolean(enabled) };
}

export async function listFlags() {
  const settings = await systemSettingsService.listSettings({ category: 'feature_flags' });

  return settings.map((s) => ({
    flagName: s.key.startsWith(FLAG_PREFIX) ? s.key.substring(FLAG_PREFIX.length) : s.key,
    enabled: Boolean(s.value),
    description: s.description,
    updatedAt: s.updatedAt,
  }));
}

export async function getFlagsForUser({ userId, roleNames = [] }) {
  const flags = await listFlags();

  const result = {};

  for (const flag of flags) {
    result[flag.flagName] = flag.enabled;
  }

  return result;
}

export const featureFlagService = {
  isFlagEnabled,
  setFlag,
  listFlags,
  getFlagsForUser,
  FLAG_PREFIX,
};