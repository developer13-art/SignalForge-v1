'use strict';

const {
  PROOF_MEMO_VERSION,
  PROOF_KINDS,
  PROOF_RESULT_VALUES,
} = require('../../constants/proof-of-alpha');

/**
 * SignalForge - Memo Payload Schema
 *
 * Describes the canonical JSON payload written to the Solana Memo
 * program. The schema is intentionally compact because the memo size
 * is bounded by the program.
 */

const MEMO_PAYLOAD_SCHEMA = Object.freeze({
  type: 'object',
  required: ['v', 'k', 'p'],
  properties: {
    v: { type: 'integer', minimum: 1 },
    k: { type: 'string', enum: Object.values(PROOF_KINDS) },
    p: { type: 'string', minLength: 1, maxLength: 64 },
    t: { type: 'string', maxLength: 64 },
    s: { type: 'string', maxLength: 24 },
    d: { type: 'string', maxLength: 8 },
    u: { type: 'number' },
    r: { type: 'number' },
    o: { type: 'string', enum: Object.values(PROOF_RESULT_VALUES) },
    oa: { type: 'integer' },
    ca: { type: 'integer' },
    c: { type: 'number' },
    sig: { type: 'string', maxLength: 48 },
    i: { type: 'integer' },
    q: { type: 'number', minimum: 0, maximum: 100 },
    m: { type: 'string', maxLength: 64 },
    ps: { type: ['integer', 'null'] },
    pe: { type: ['integer', 'null'] },
  },
  additionalProperties: false,
});

function validateMemoPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['payload must be an object'] };
  }

  if (payload.v !== PROOF_MEMO_VERSION) {
    errors.push(`payload.v must equal ${PROOF_MEMO_VERSION}`);
  }

  if (!payload.k || !Object.values(PROOF_KINDS).includes(payload.k)) {
    errors.push('payload.k must be a supported kind');
  }

  if (!payload.p || typeof payload.p !== 'string') {
    errors.push('payload.p (providerId) is required');
  }

  if (payload.k === PROOF_KINDS.TRADE_CLOSED) {
    if (!payload.t) {
      errors.push('payload.t (tradeId) is required for trade_closed');
    }
    if (!payload.s) {
      errors.push('payload.s (symbol) is required for trade_closed');
    }
  }

  if (payload.k === PROOF_KINDS.PROVIDER_CERTIFIED) {
    if (payload.q === undefined) {
      errors.push('payload.q (qualityScore) is required for provider_certified');
    }
  }

  if (payload.k === PROOF_KINDS.PROVIDER_MILESTONE) {
    if (!payload.m) {
      errors.push('payload.m (milestoneKey) is required for provider_milestone');
    }
  }

  return { valid: errors.length === 0, errors };
}

function buildMemoPayload({ version, kind, providerId, extra = {} } = {}) {
  return {
    v: version || PROOF_MEMO_VERSION,
    k: kind,
    p: providerId,
    ...extra,
  };
}

module.exports = {
  MEMO_PAYLOAD_SCHEMA,
  validateMemoPayload,
  buildMemoPayload,
};