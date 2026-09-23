/**
 * Copy Trading Validators
 *
 * @module signalforge/server/modules/copy-trading/validator
 */

import { SCALING_MODE_VALUES } from './copy-trading.constants.js';

export function validateSubscriptionPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.providerId || typeof body.providerId !== 'string') {
    errors.push('providerId is required');
  }

  if (!body.brokerAccountId || typeof body.brokerAccountId !== 'string') {
    errors.push('brokerAccountId is required');
  }

  if (body.scalingMode !== undefined && !SCALING_MODE_VALUES.includes(body.scalingMode)) {
    errors.push(`scalingMode must be one of: ${SCALING_MODE_VALUES.join(', ')}`);
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

  if (body.lotMultiplier !== undefined) {
    if (typeof body.lotMultiplier !== 'number' || body.lotMultiplier <= 0) {
      errors.push('lotMultiplier must be a positive number');
    }
  }

  if (body.allowedSymbols !== undefined && !Array.isArray(body.allowedSymbols)) {
    errors.push('allowedSymbols must be an array');
  }

  if (body.blockedSymbols !== undefined && !Array.isArray(body.blockedSymbols)) {
    errors.push('blockedSymbols must be an array');
  }

  return { valid: errors.length === 0, errors };
}

export function validateSubscriptionUpdatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.scalingMode !== undefined && !SCALING_MODE_VALUES.includes(body.scalingMode)) {
    errors.push(`scalingMode must be one of: ${SCALING_MODE_VALUES.join(', ')}`);
  }

  if (body.fixedLot !== undefined && (typeof body.fixedLot !== 'number' || body.fixedLot <= 0)) {
    errors.push('fixedLot must be a positive number');
  }

  if (body.percentage !== undefined && (typeof body.percentage !== 'number' || body.percentage <= 0)) {
    errors.push('percentage must be a positive number');
  }

  if (body.maxLotSize !== undefined && (typeof body.maxLotSize !== 'number' || body.maxLotSize <= 0)) {
    errors.push('maxLotSize must be a positive number');
  }

  if (body.lotMultiplier !== undefined && (typeof body.lotMultiplier !== 'number' || body.lotMultiplier <= 0)) {
    errors.push('lotMultiplier must be a positive number');
  }

  return { valid: errors.length === 0, errors };
}

export function validateFanOutPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.providerId || typeof body.providerId !== 'string') {
    errors.push('providerId is required');
  }

  if (!body.signal || typeof body.signal !== 'object') {
    errors.push('signal is required');
  } else {
    if (!body.signal.symbol) {
      errors.push('signal.symbol is required');
    }
    if (!body.signal.direction) {
      errors.push('signal.direction is required');
    }
    if (typeof body.signal.volume !== 'number' || body.signal.volume <= 0) {
      errors.push('signal.volume must be a positive number');
    }
  }

  return { valid: errors.length === 0, errors };
}