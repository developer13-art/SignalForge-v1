'use strict';

/**
 * SignalForge - Solana Actions POST Request Schema
 *
 * A POST request to a Solana Actions endpoint contains the connected
 * wallet's public key in the `account` field, and optionally any
 * additional parameters declared by the action.
 */

const ACTION_POST_REQUEST_SCHEMA = Object.freeze({
  type: 'object',
  required: ['account'],
  properties: {
    account: {
      type: 'string',
      minLength: 32,
      maxLength: 44,
      pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$',
    },
  },
  additionalProperties: true,
});

const BASE58_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function validateActionPostRequest(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['request body must be an object'] };
  }

  if (!payload.account || typeof payload.account !== 'string') {
    errors.push('account is required');
  } else if (!BASE58_PATTERN.test(payload.account)) {
    errors.push('account must be a valid base58 Solana public key');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function extractAccount(payload) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  return typeof payload.account === 'string' ? payload.account.trim() : null;
}

function extractCustomParameters(payload, schema = {}) {
  const result = {};
  if (!payload || typeof payload !== 'object') {
    return result;
  }
  const allowed = Object.keys(schema);
  for (const key of allowed) {
    if (payload[key] !== undefined) {
      result[key] = payload[key];
    }
  }
  return result;
}

module.exports = {
  ACTION_POST_REQUEST_SCHEMA,
  BASE58_PATTERN,
  validateActionPostRequest,
  extractAccount,
  extractCustomParameters,
};