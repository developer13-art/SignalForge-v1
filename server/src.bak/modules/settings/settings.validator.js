/**
 * Settings Validator
 *
 * @module server/modules/settings/settings.validator
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import {
  SETTING_CATEGORY_VALUES,
  SETTING_VALUE_TYPE_VALUES,
  isReservedKey,
} from './settings.constants';

const MAX_KEY_LENGTH = 128;
const MAX_VALUE_LENGTH = 10000;
const MAX_DESCRIPTION_LENGTH = 512;

export function validateSettingKey(key) {
  if (!key || typeof key !== 'string') {
    throw new AppError('key is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const trimmed = key.trim();

  if (trimmed.length === 0 || trimmed.length > MAX_KEY_LENGTH) {
    throw new AppError(`key must be between 1 and ${MAX_KEY_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
    throw new AppError('key contains invalid characters', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (isReservedKey(trimmed)) {
    throw new AppError('This setting key is reserved', ERROR_CODES.AUTHORIZATION_FAILED, 403);
  }

  return trimmed;
}

export function validateSettingPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const category = payload.category || 'general';

  if (!SETTING_CATEGORY_VALUES.includes(category)) {
    throw new AppError(`Invalid category: ${category}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let valueType = payload.valueType || 'string';

  if (!SETTING_VALUE_TYPE_VALUES.includes(valueType)) {
    throw new AppError(`Invalid valueType: ${valueType}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (payload.value === undefined) {
    throw new AppError('value is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (valueType === 'string' && typeof payload.value !== 'string') {
    throw new AppError('value must be a string for string type', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (valueType === 'number' && typeof payload.value !== 'number') {
    throw new AppError('value must be a number for number type', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (valueType === 'boolean' && typeof payload.value !== 'boolean') {
    throw new AppError('value must be a boolean for boolean type', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (valueType === 'json' && typeof payload.value !== 'object') {
    throw new AppError('value must be an object for json type', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (typeof payload.value === 'string' && payload.value.length > MAX_VALUE_LENGTH) {
    throw new AppError(`value exceeds ${MAX_VALUE_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let description = null;
  if (payload.description !== undefined && payload.description !== null) {
    if (typeof payload.description !== 'string') {
      throw new AppError('description must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    if (payload.description.length > MAX_DESCRIPTION_LENGTH) {
      throw new AppError(`description exceeds ${MAX_DESCRIPTION_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
    description = payload.description;
  }

  return {
    value: payload.value,
    valueType,
    category,
    description,
    isPublic: Boolean(payload.isPublic),
  };
}

export const SETTINGS_VALIDATION_CONSTRAINTS = Object.freeze({
  maxKeyLength: MAX_KEY_LENGTH,
  maxValueLength: MAX_VALUE_LENGTH,
  maxDescriptionLength: MAX_DESCRIPTION_LENGTH,
});