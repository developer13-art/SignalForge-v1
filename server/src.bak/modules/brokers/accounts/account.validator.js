/**
 * Broker Account Validator
 *
 * @module signalforge/server/modules/brokers/accounts/validator
 */

import {
  BROKER_PLATFORM_VALUES,
  ACCOUNT_TYPE_VALUES,
} from '../broker.constants.js';

export function validateCreateAccountPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.platform || !BROKER_PLATFORM_VALUES.includes(body.platform)) {
    errors.push(`platform must be one of: ${BROKER_PLATFORM_VALUES.join(', ')}`);
  }

  if (!body.accountNumber || typeof body.accountNumber !== 'string') {
    errors.push('accountNumber is required');
  } else if (body.accountNumber.length > 64) {
    errors.push('accountNumber must not exceed 64 characters');
  }

  if (!body.server || typeof body.server !== 'string') {
    errors.push('server is required');
  } else if (body.server.length > 128) {
    errors.push('server must not exceed 128 characters');
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.push('password is required');
  } else if (body.password.length < 1 || body.password.length > 128) {
    errors.push('password must be between 1 and 128 characters');
  }

  if (body.accountType !== undefined && !ACCOUNT_TYPE_VALUES.includes(body.accountType)) {
    errors.push(`accountType must be one of: ${ACCOUNT_TYPE_VALUES.join(', ')}`);
  }

  if (body.brokerName !== undefined && typeof body.brokerName !== 'string') {
    errors.push('brokerName must be a string');
  }

  if (body.accountNickname !== undefined) {
    if (typeof body.accountNickname !== 'string' || body.accountNickname.length > 128) {
      errors.push('accountNickname must not exceed 128 characters');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateUpdateAccountPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.accountNickname !== undefined) {
    if (typeof body.accountNickname !== 'string' || body.accountNickname.length > 128) {
      errors.push('accountNickname must not exceed 128 characters');
    }
  }

  if (body.accountType !== undefined && !ACCOUNT_TYPE_VALUES.includes(body.accountType)) {
    errors.push(`accountType must be one of: ${ACCOUNT_TYPE_VALUES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateCredentialsUpdatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.push('password is required');
  } else if (body.password.length < 1 || body.password.length > 128) {
    errors.push('password must be between 1 and 128 characters');
  }

  return { valid: errors.length === 0, errors };
}