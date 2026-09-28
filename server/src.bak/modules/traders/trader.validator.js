/**
 * Trader Validators
 *
 * @module signalforge/server/modules/traders/validator
 */

import {
  TRADER_VISIBILITY_VALUES,
  COPY_MODE_VALUES,
} from './trader.constants.js';

export function validateTraderRegistrationPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.displayName || typeof body.displayName !== 'string') {
    errors.push('displayName is required');
  } else if (body.displayName.length > 128) {
    errors.push('displayName must not exceed 128 characters');
  }

  if (body.slug !== undefined) {
    if (typeof body.slug !== 'string') {
      errors.push('slug must be a string');
    } else if (!/^[a-z0-9][a-z0-9-]{2,63}$/.test(body.slug)) {
      errors.push('slug must be lowercase alphanumeric with hyphens, 3 to 64 characters');
    }
  }

  if (body.bio !== undefined && body.bio !== null) {
    if (typeof body.bio !== 'string' || body.bio.length > 2000) {
      errors.push('bio must not exceed 2000 characters');
    }
  }

  if (body.visibility !== undefined && !TRADER_VISIBILITY_VALUES.includes(body.visibility)) {
    errors.push(`visibility must be one of: ${TRADER_VISIBILITY_VALUES.join(', ')}`);
  }

  if (body.tags !== undefined && !Array.isArray(body.tags)) {
    errors.push('tags must be an array');
  }

  return { valid: errors.length === 0, errors };
}

export function validateTraderUpdatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.displayName !== undefined) {
    if (typeof body.displayName !== 'string' || body.displayName.length > 128) {
      errors.push('displayName must not exceed 128 characters');
    }
  }

  if (body.bio !== undefined && body.bio !== null) {
    if (typeof body.bio !== 'string' || body.bio.length > 2000) {
      errors.push('bio must not exceed 2000 characters');
    }
  }

  if (body.visibility !== undefined && !TRADER_VISIBILITY_VALUES.includes(body.visibility)) {
    errors.push(`visibility must be one of: ${TRADER_VISIBILITY_VALUES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateFollowPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.copyMode !== undefined && !COPY_MODE_VALUES.includes(body.copyMode)) {
    errors.push(`copyMode must be one of: ${COPY_MODE_VALUES.join(', ')}`);
  }

  if (body.fixedLot !== undefined) {
    if (typeof body.fixedLot !== 'number' || body.fixedLot <= 0) {
      errors.push('fixedLot must be a positive number');
    }
  }

  if (body.percentage !== undefined) {
    if (typeof body.percentage !== 'number' || body.percentage <= 0 || body.percentage > 1000) {
      errors.push('percentage must be between 0 and 1000');
    }
  }

  if (body.lotMultiplier !== undefined) {
    if (typeof body.lotMultiplier !== 'number' || body.lotMultiplier <= 0) {
      errors.push('lotMultiplier must be a positive number');
    }
  }

  if (body.maxLotSize !== undefined) {
    if (typeof body.maxLotSize !== 'number' || body.maxLotSize <= 0) {
      errors.push('maxLotSize must be a positive number');
    }
  }

  if (body.minLotSize !== undefined) {
    if (typeof body.minLotSize !== 'number' || body.minLotSize < 0) {
      errors.push('minLotSize must be a non-negative number');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateCopySettingsPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.copyMode !== undefined && !COPY_MODE_VALUES.includes(body.copyMode)) {
    errors.push(`copyMode must be one of: ${COPY_MODE_VALUES.join(', ')}`);
  }

  if (body.fixedLot !== undefined && (typeof body.fixedLot !== 'number' || body.fixedLot <= 0)) {
    errors.push('fixedLot must be a positive number');
  }

  if (body.percentage !== undefined) {
    if (typeof body.percentage !== 'number' || body.percentage <= 0 || body.percentage > 1000) {
      errors.push('percentage must be between 0 and 1000');
    }
  }

  if (body.lotMultiplier !== undefined && (typeof body.lotMultiplier !== 'number' || body.lotMultiplier <= 0)) {
    errors.push('lotMultiplier must be a positive number');
  }

  return { valid: errors.length === 0, errors };
}