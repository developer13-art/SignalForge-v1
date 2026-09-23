/**
 * Source Validators
 *
 * @module signalforge/server/modules/signal-sources/validator
 */

import { SOURCE_TYPES } from './source.constants.js';

export function validateCreateSourcePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.sourceType || typeof body.sourceType !== 'string') {
    errors.push('Source type is required');
  } else if (!Object.values(SOURCE_TYPES).includes(body.sourceType)) {
    errors.push(`Source type must be one of: ${Object.values(SOURCE_TYPES).join(', ')}`);
  }

  if (!body.name || typeof body.name !== 'string') {
    errors.push('Source name is required');
  } else if (body.name.length > 128) {
    errors.push('Source name must not exceed 128 characters');
  }

  return { valid: errors.length === 0, errors };
}

export function validateUpdateSourcePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.length > 128) {
      errors.push('Source name must not exceed 128 characters');
    }
  }

  if (body.listenerEnabled !== undefined && typeof body.listenerEnabled !== 'boolean') {
    errors.push('listenerEnabled must be a boolean');
  }

  return { valid: errors.length === 0, errors };
}

export function validateMessageFilters(query) {
  const errors = [];

  if (!query || typeof query !== 'object') {
    return { valid: true, errors: [] };
  }

  if (query.limit !== undefined) {
    const limit = Number(query.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
      errors.push('Limit must be between 1 and 200');
    }
  }

  return { valid: errors.length === 0, errors };
}