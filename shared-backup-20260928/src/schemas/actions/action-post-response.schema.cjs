'use strict';

/**
 * SignalForge - Solana Actions POST Response Schema
 *
 * A POST response returns a base64-encoded transaction for the wallet
 * to sign, and an optional message to display to the user.
 */

const ACTION_POST_RESPONSE_SCHEMA = Object.freeze({
  type: 'object',
  required: ['transaction'],
  properties: {
    transaction: {
      type: 'string',
      minLength: 100,
      pattern: '^[A-Za-z0-9+/]+={0,2}$',
    },
    message: {
      type: 'string',
      maxLength: 200,
    },
    reference: {
      type: 'string',
      minLength: 32,
      maxLength: 44,
    },
  },
  additionalProperties: false,
});

const BASE64_PATTERN = /^[A-Za-z0-9+/]*={0,2}$/;
const BASE58_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function validateActionPostResponse(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['response must be an object'] };
  }

  if (!payload.transaction || typeof payload.transaction !== 'string') {
    errors.push('transaction is required');
  } else if (!BASE64_PATTERN.test(payload.transaction)) {
    errors.push('transaction must be a base64-encoded string');
  }

  if (payload.message && typeof payload.message !== 'string') {
    errors.push('message must be a string');
  } else if (payload.message && payload.message.length > 200) {
    errors.push('message must not exceed 200 characters');
  }

  if (payload.reference) {
    if (typeof payload.reference !== 'string' || !BASE58_PATTERN.test(payload.reference)) {
      errors.push('reference must be a valid base58 Solana public key');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function buildActionPostResponse({ transaction, message, reference }) {
  const payload = { transaction };
  if (message) {
    payload.message = message.slice(0, 200);
  }
  if (reference) {
    payload.reference = reference;
  }
  return payload;
}

function buildActionErrorResponse({ message, code }) {
  return {
    message: message || 'The action could not be completed.',
    error: { code: code || 'ACTION_FAILED' },
  };
}

module.exports = {
  ACTION_POST_RESPONSE_SCHEMA,
  BASE64_PATTERN,
  BASE58_PATTERN,
  validateActionPostResponse,
  buildActionPostResponse,
  buildActionErrorResponse,
};