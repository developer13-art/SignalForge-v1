'use strict';

const {
  PROOF_VERIFICATION_LEVELS,
} = require('../../constants/proof-of-alpha');

/**
 * SignalForge - Proof Verification Schema
 *
 * Describes the shape of a verification response from the API.
 */

const PROOF_VERIFICATION_SCHEMA = Object.freeze({
  type: 'object',
  required: ['signature', 'valid', 'matches', 'level'],
  properties: {
    signature: { type: 'string' },
    valid: { type: 'boolean' },
    matches: { type: 'boolean' },
    level: { type: 'string', enum: Object.values(PROOF_VERIFICATION_LEVELS) },
    reason: { type: 'string' },
    parsed: { type: 'object' },
    memoHash: { type: ['string', 'null'] },
    onChainHash: { type: ['string', 'null'] },
    verification: { type: 'object' },
    proof: { type: 'object' },
    fetched: { type: 'object' },
  },
  additionalProperties: true,
});

function validateProofVerification(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['payload must be an object'] };
  }

  if (!payload.signature) {
    errors.push('signature is required');
  }

  if (typeof payload.valid !== 'boolean') {
    errors.push('valid must be a boolean');
  }

  if (typeof payload.matches !== 'boolean') {
    errors.push('matches must be a boolean');
  }

  if (!Object.values(PROOF_VERIFICATION_LEVELS).includes(payload.level)) {
    errors.push('level must be a supported verification level');
  }

  return { valid: errors.length === 0, errors };
}

function buildVerificationResult({ signature, valid, matches, level, reason, memoHash, onChainHash }) {
  return {
    signature,
    valid: valid === true,
    matches: matches === true,
    level: level || PROOF_VERIFICATION_LEVELS.UNVERIFIED,
    reason: reason || null,
    memoHash: memoHash || null,
    onChainHash: onChainHash || null,
  };
}

module.exports = {
  PROOF_VERIFICATION_SCHEMA,
  validateProofVerification,
  buildVerificationResult,
};