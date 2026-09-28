/**
 * System Settings Service
 *
 * Business logic for reading and writing platform settings. Handles
 * typed value coercion, in-memory caching, and change notifications.
 *
 * @module server/modules/admin/system/system-settings.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { publishEvent } = require('../../../events/event-publisher');
const { EVENT_TYPES } = require('@signalforge/shared/constants/event-types');
const repository = require('./system-settings.repository');

const CACHE_TTL_MS = 60 * 1000;
const CACHE = new Map();

function coerceValue({ value, valueType }) {
  if (value === null || value === undefined) {
    return null;
  }

  switch (valueType) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === 'true' || value === true || value === '1' || value === 1;
    case 'json':
      try {
        return typeof value === 'string' ? JSON.parse(value) : value;
      } catch (err) {
        return null;
      }
    default:
      return String(value);
  }
}

function stringifyValue({ value, valueType }) {
  if (value === null || value === undefined) {
    return null;
  }

  if (valueType === 'json') {
    return JSON.stringify(value);
  }

  return String(value);
}

function readCache(key) {
  const entry = CACHE.get(key);
  if (!entry) {
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    CACHE.delete(key);
    return null;
  }
  return entry.value;
}

function writeCache(key, value) {
  CACHE.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}
function invalidateCache(key) {
  if (key) {
    CACHE.delete(key);
  } else {
    CACHE.clear();
  }
}

export async function getSetting({ key, defaultValue = null }) {
  if (!key) {
    throw new AppError('key is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const cached = readCache(key);
  if (cached !== null) {
    return cached;
  }

  const record = await repository.findByKey({ key });

  if (!record) {
    return defaultValue;
  }

  const value = coerceValue({ value: record.value, valueType: record.value_type });

  writeCache(key, value);

  return value;
}

export async function setSetting({ key, value, valueType, category, description, isPublic, actorId }) {
  if (!key) {
    throw new AppError('key is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const resolvedType = valueType || (typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : typeof value === 'object' ? 'json' : 'string');

  const stringValue = stringifyValue({ value, valueType: resolvedType });

  const record = await repository.upsertSetting({
    key,
    value: stringValue,
    valueType: resolvedType,
    category,
    description,
    isPublic,
    updatedBy: actorId,
  });

  invalidateCache(key);

  await publishEvent({
    eventType: EVENT_TYPES.AUDIT_LOG_CREATED,
    source: 'system-settings.service',
    actorId: actorId || null,
    payload: {
      action: 'SYSTEM_SETTING_UPDATE',
      key,
      valueType: resolvedType,
      isPublic: Boolean(isPublic),
    },
  }).catch((err) => logger.warn({ err }, 'Failed to publish system setting event'));

  logger.info({ key, valueType: resolvedType, actorId }, 'System setting updated');

  return {
    key: record.key,
    valueType: record.value_type,
    category: record.category,
    description: record.description,
    isPublic: record.is_public,
    updatedAt: record.updated_at,
  };
}

export async function listSettings({ category } = {}) {
  const rows = await repository.listAll({ category });

  return rows.map((row) => ({
    key: row.key,
    value: coerceValue({ value: row.value, valueType: row.value_type }),
    valueType: row.value_type,
    category: row.category,
    description: row.description,
    isPublic: row.is_public,
    updatedAt: row.updated_at,
  }));
}

export async function listPublicSettings() {
  const rows = await repository.listPublicSettings();

  return rows.map((row) => ({
    key: row.key,
    value: coerceValue({ value: row.value, valueType: row.value_type }),
    valueType: row.value_type,
  }));
}

export async function deleteSetting({ key, actorId }) {
  if (!key) {
    throw new AppError('key is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const deleted = await repository.deleteSetting({ key });

  if (!deleted) {
    throw new AppError('Setting not found', ERROR_CODES.NOT_FOUND, 404);
  }

  invalidateCache(key);

  logger.info({ key, actorId }, 'System setting deleted');

  return { deleted: true };
}
const systemSettingsService = {
  getSetting,
  setSetting,
  listSettings,
  listPublicSettings,
  deleteSetting,
  invalidateCache,
};
module.exports.systemSettingsService = systemSettingsService;
module.exports.invalidateCache = invalidateCache;
