'use strict';

const {
  PROOF_KINDS,
  PROOF_STATUSES,
  PROOF_VERIFICATION_LEVELS,
} = require('../../constants/proof-of-alpha');

/**
 * SignalForge - Proof Record Schema
 *
 * Describes the shape of a proof record returned by the API. Used by
 * the frontend to validate responses before rendering.
 */

const PROOF_RECORD_SCHEMA = Object.freeze({
  type: 'object',
  required: ['id', 'provider_id', 'kind', 'status'],
  properties: {
    id: { type: 'string' },
    provider_id: { type: 'string' },
    trade_id: { type: ['string', 'null'] },
    kind: { type: 'string', enum: Object.values(PROOF_KINDS) },
    status: { type: 'string', enum: Object.values(PROOF_STATUSES) },
    verification_level: {
      type: 'string',
      enum: Object.values(PROOF_VERIFICATION_LEVELS),
    },
    memo_version: { type: 'integer' },
    memo_payload: { type: 'object' },
    memo_bytes: { type: 'integer' },
    signature: { type: ['string', 'null'] },
    reference: { type: ['string', 'null'] },
    block_slot: { type: ['integer', 'null'] },
    block_time: { type: ['integer', 'null'] },
    authority_public_key: { type: ['string', 'null'] },
    error_message: { type: ['string', 'null'] },
    submitted_at: { type: ['string', 'null'], format: 'date-time' },
    confirmed_at: { type: ['string', 'null'], format: 'date-time' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
  additionalProperties: true,
});

function validateProofRecord(record) {
  const errors = [];

  if (!record || typeof record !== 'object') {
    return { valid: false, errors: ['record must be an object'] };
  }

  if (!record.id) {
    errors.push('id is required');
  }

  if (!record.provider_id) {
    errors.push('provider_id is required');
  }

  if (!Object.values(PROOF_KINDS).includes(record.kind)) {
    errors.push('kind must be a supported proof kind');
  }

  if (!Object.values(PROOF_STATUSES).includes(record.status)) {
    errors.push('status must be a supported proof status');
  }

  return { valid: errors.length === 0, errors };
}

function normalizeProofRecord(record) {
  if (!record) {
    return null;
  }
  return {
    id: record.id,
    providerId: record.provider_id,
    tradeId: record.trade_id,
    kind: record.kind,
    status: record.status,
    verificationLevel: record.verification_level,
    memoVersion: record.memo_version,
    memoPayload: record.memo_payload,
    memoBytes: record.memo_bytes,
    signature: record.signature,
    reference: record.reference,
    blockSlot: record.block_slot,
    blockTime: record.block_time,
    authorityPublicKey: record.authority_public_key,
    errorMessage: record.error_message,
    submittedAt: record.submitted_at,
    confirmedAt: record.confirmed_at,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

module.exports = {
  PROOF_RECORD_SCHEMA,
  validateProofRecord,
  normalizeProofRecord,
};