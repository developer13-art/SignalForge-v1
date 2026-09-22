/**
 * Solana Attestation Schema
 *
 * Defines the structure of a Solana attestation record. Only hashes,
 * identifiers, and public reputation values are anchored on-chain.
 * Sensitive data never appears in an attestation.
 *
 * @module @signalforge/shared/schemas/solana-attestation
 */

import { SOLANA_ATTESTATION_TYPE_VALUES } from '../constants/solana-attestation-types.js';
import { SOLANA_ATTESTATION_STATUS_VALUES } from '../constants/solana-attestation-types.js';

export const SOLANA_ATTESTATION_SCHEMA = Object.freeze({
  type: 'object',
  required: [
    'attestationId',
    'attestationType',
    'subjectId',
    'attestationHash',
    'status',
  ],
  properties: {
    attestationId: { type: 'string', format: 'uuid' },
    attestationType: { type: 'string', enum: SOLANA_ATTESTATION_TYPE_VALUES },
    subjectId: { type: 'string', minLength: 1, maxLength: 128 },
    subjectType: {
      type: 'string',
      enum: ['PROVIDER', 'SIGNAL', 'TRADE', 'CONSENSUS'],
    },
    attestationHash: { type: 'string', pattern: '^[a-f0-9]{64}$' },
    publicData: { type: 'object', nullable: true },
    onChainData: { type: 'object', nullable: true },
    programId: { type: 'string', nullable: true, maxLength: 64 },
    pda: { type: 'string', nullable: true, maxLength: 64 },
    txSignature: { type: 'string', nullable: true, maxLength: 128 },
    slot: { type: 'number', nullable: true, minimum: 0 },
    blockTime: { type: 'number', nullable: true, minimum: 0 },
    network: { type: 'string', nullable: true, maxLength: 32 },
    status: { type: 'string', enum: SOLANA_ATTESTATION_STATUS_VALUES },
    submittedAt: { type: 'string', format: 'date-time', nullable: true },
    confirmedAt: { type: 'string', format: 'date-time', nullable: true },
    failureReason: { type: 'string', nullable: true, maxLength: 1024 },
    revokedAt: { type: 'string', format: 'date-time', nullable: true },
    revocationReason: { type: 'string', nullable: true, maxLength: 512 },
    createdAt: { type: 'string', format: 'date-time' },
    metadata: { type: 'object', nullable: true },
  },
  additionalProperties: false,
});

export function buildSolanaAttestation(input) {
  return {
    attestationId: input.attestationId,
    attestationType: input.attestationType,
    subjectId: input.subjectId,
    subjectType: input.subjectType,
    attestationHash: input.attestationHash,
    publicData: input.publicData || null,
    onChainData: input.onChainData || null,
    programId: input.programId || null,
    pda: input.pda || null,
    txSignature: input.txSignature || null,
    slot: input.slot ?? null,
    blockTime: input.blockTime ?? null,
    network: input.network || null,
    status: input.status,
    submittedAt: input.submittedAt || null,
    confirmedAt: input.confirmedAt || null,
    failureReason: input.failureReason || null,
    revokedAt: input.revokedAt || null,
    revocationReason: input.revocationReason || null,
    createdAt: input.createdAt || new Date().toISOString(),
    metadata: input.metadata || null,
  };
}

export function validateSolanaAttestation(attestation) {
  const errors = [];

  if (!attestation || typeof attestation !== 'object') {
    return { valid: false, errors: ['Attestation must be an object'] };
  }

  for (const field of SOLANA_ATTESTATION_SCHEMA.required) {
    if (attestation[field] === undefined || attestation[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (
    attestation.attestationType &&
    !SOLANA_ATTESTATION_TYPE_VALUES.includes(attestation.attestationType)
  ) {
    errors.push(`Invalid attestationType: ${attestation.attestationType}`);
  }

  if (
    attestation.status &&
    !SOLANA_ATTESTATION_STATUS_VALUES.includes(attestation.status)
  ) {
    errors.push(`Invalid status: ${attestation.status}`);
  }

  if (
    attestation.attestationHash &&
    !/^[a-f0-9]{64}$/.test(attestation.attestationHash)
  ) {
    errors.push('attestationHash must be a 64-character hexadecimal string');
  }

  return { valid: errors.length === 0, errors };
}

export const SOLANA_ATTESTATION_FIELDS = Object.freeze(
  Object.keys(SOLANA_ATTESTATION_SCHEMA.properties),
);