/**
 * Feature Flag Service
 *
 * Manages feature flags stored in the system_settings table under
 * the `feature_flags.*` namespace. Provides typed boolean reads and
 * writes and invalidates the settings cache when flags change.
 *
 * @module server/modules/admin/system/feature-flag.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { systemSettingsService } = require('./system-settings.service');

const FLAG_PREFIX = 'feature_flags.';

function buildKey(flagName) {
  return `${FLAG_PREFIX}${flagName}`;
}
async function isFlagEnabled({ flagName, defaultValue = false }) {
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
async function setFlag({ flagName, enabled, actorId, description }) {
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
async function listFlags() {
  const settings = await systemSettingsService.listSettings({ category: 'feature_flags' });

  return settings.map((s) => ({
    flagName: s.key.startsWith(FLAG_PREFIX) ? s.key.substring(FLAG_PREFIX.length) : s.key,
    enabled: Boolean(s.value),
    description: s.description,
    updatedAt: s.updatedAt,
  }));
}
async function getFlagsForUser({ userId, roleNames = [] }) {
  const flags = await listFlags();

  const result = {};

  for (const flag of flags) {
    result[flag.flagName] = flag.enabled;
  }

  return result;
}
const featureFlagService = {
  isFlagEnabled,
  setFlag,
  listFlags,
  getFlagsForUser,
  FLAG_PREFIX,
};
module.exports.featureFlagService = featureFlagService;

module.exports.isFlagEnabled = isFlagEnabled;

module.exports.setFlag = setFlag;

module.exports.listFlags = listFlags;

module.exports.getFlagsForUser = getFlagsForUser;
