/**
 * Settings Service
 *
 * Business logic for reading and writing platform settings. Applies
 * typed value coercion and caching, and prevents direct modification
 * of reserved keys.
 *
 * @module server/modules/settings/settings.service
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { logger } from '../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../database';
import { publishEvent } from '../../events/event-publisher';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { SETTING_CATEGORY_VALUES, isReservedKey } from './settings.constants';
import * as repository from './settings.repository';

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

export function invalidateCache(key) {
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

export async function setSetting({
  key,
  value,
  valueType,
  category,
  description,
  isPublic,
  actorId,
}) {
  if (!key) {
    throw new AppError('key is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (isReservedKey(key)) {
    throw new AppError('Cannot modify reserved setting', ERROR_CODES.AUTHORIZATION_FAILED, 403);
  }

  const resolvedType =
    valueType ||
    (typeof value === 'number'
      ? 'number'
      : typeof value === 'boolean'
        ? 'boolean'
        : typeof value === 'object'
          ? 'json'
          : 'string');

  const stringValue = stringifyValue({ value, valueType: resolvedType });

  const record = await repository.upsert({
    key,
    value: stringValue,
    valueType: resolvedType,
    category: category || 'general',
    description,
    isPublic,
    updatedBy: actorId,
  });

  invalidateCache(key);

  await publishEvent({
    eventType: EVENT_TYPES.AUDIT_LOG_CREATED,
    source: 'settings.service',
    actorId: actorId || null,
    payload: {
      action: 'SYSTEM_SETTING_UPDATE',
      key,
      valueType: resolvedType,
      isPublic: Boolean(isPublic),
    },
  }).catch((err) => logger.warn({ err }, 'Failed to publish setting event'));

  logger.info({ key, valueType: resolvedType, actorId }, 'Setting updated');

  return {
    key: record.key,
    value: coerceValue({ value: record.value, valueType: record.value_type }),
    valueType: record.value_type,
    category: record.category,
    description: record.description,
    isPublic: record.is_public,
    updatedAt: record.updated_at,
  };
}

export async function listSettings({ category } = {}) {
  const rows = category ? await repository.listByCategory({ category }) : await repository.listAll();

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
  const rows = await repository.listPublic();

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

  if (isReservedKey(key)) {
    throw new AppError('Cannot delete reserved setting', ERROR_CODES.AUTHORIZATION_FAILED, 403);
  }

  const deleted = await repository.deleteByKey({ key });

  if (!deleted) {
    throw new AppError('Setting not found', ERROR_CODES.NOT_FOUND, 404);
  }

  invalidateCache(key);

  logger.info({ key, actorId }, 'Setting deleted');

  return { deleted: true };
}

export async function getSettingsByCategories({ categories }) {
  if (!Array.isArray(categories) || categories.length === 0) {
    throw new AppError('categories must be a non-empty array', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const invalid = categories.find((c) => !SETTING_CATEGORY_VALUES.includes(c));

  if (invalid) {
    throw new AppError(`Invalid category: ${invalid}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT key, value, value_type, category
       FROM system_settings
      WHERE category = ANY($1)
      ORDER BY category ASC, key ASC`,
    [categories],
  );

  const grouped = {};

  for (const row of rows) {
    if (!grouped[row.category]) {
      grouped[row.category] = {};
    }
    grouped[row.category][row.key] = coerceValue({ value: row.value, valueType: row.value_type });
  }

  return grouped;
}

export async function getBulkSettings({ keys }) {
  if (!Array.isArray(keys) || keys.length === 0) {
    throw new AppError('keys must be a non-empty array', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT key, value, value_type
       FROM system_settings
      WHERE key = ANY($1)`,
    [keys],
  );

  const result = {};
  for (const row of rows) {
    result[row.key] = coerceValue({ value: row.value, valueType: row.value_type });
  }

  return result;
}

export const settingsService = {
  getSetting,
  setSetting,
  listSettings,
  listPublicSettings,
  deleteSetting,
  getSettingsByCategories,
  getBulkSettings,
  invalidateCache,
};