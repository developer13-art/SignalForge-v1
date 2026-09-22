/**
 * Solana Provenance Schema
 *
 * Defines the structure of a Solana provenance record. Provenance
 * anchors a cryptographic hash of an AI signal processing record on
 * Solana so that the signal's processing history is verifiable without
 * exposing the raw message content.
 *
 * @module @signalforge/shared/schemas/solana-provenance
 */

export const SOLANA_PROVENANCE_SCHEMA = Object.freeze({
  type: 'object',
  required: [
    'provenanceId',
    'signalId',
    'processingHash',
    'aiVersion',
    'anchoredAt',
  ],
  properties: {
    provenanceId: { type: 'string', format: 'uuid' },
    signalId: { type: 'string', format: 'uuid' },
    providerId: { type: 'string', format: 'uuid', nullable: true },
    tradeId: { type: 'string', format: 'uuid', nullable: true },
    processingHash: { type: 'string', pattern: '^[a-f0-9]{64}$' },
    signalHash: { type: 'string', pattern: '^[a-f0-9]{64}$', nullable: true },
    aiVersion: { type: 'string', minLength: 1, maxLength: 64 },
    modelId: { type: 'string', nullable: true, maxLength: 128 },
    parserType: { type: 'string', nullable: true, maxLength: 32 },
    processingSteps: {
      type: 'array',
      items: { type: 'string' },
      default: [],
    },
    publicData: { type: 'object', nullable: true },
    programId: { type: 'string', nullable: true, maxLength: 64 },
    pda: { type: 'string', nullable: true, maxLength: 64 },
    txSignature: { type: 'string', nullable: true, maxLength: 128 },
    slot: { type: 'number', nullable: true, minimum: 0 },
    blockTime: { type: 'number', nullable: true, minimum: 0 },
    network: { type: 'string', nullable: true, maxLength: 32 },
    status: {
      type: 'string',
      enum: ['PENDING', 'SUBMITTED', 'CONFIRMED', 'FAILED'],
      default: 'PENDING',
    },
    failureReason: { type: 'string', nullable: true, maxLength: 1024 },
    anchoredAt: { type: 'string', format: 'date-time' },
    createdAt: { type: 'string', format: 'date-time' },
    metadata: { type: 'object', nullable: true },
  },
  additionalProperties: false,
});

export function buildSolanaProvenance(input) {
  return {
    provenanceId: input.provenanceId,
    signalId: input.signalId,
    providerId: input.providerId || null,
    tradeId: input.tradeId || null,
    processingHash: input.processingHash,
    signalHash: input.signalHash || null,
    aiVersion: input.aiVersion,
    modelId: input.modelId || null,
    parserType: input.parserType || null,
    processingSteps: input.processingSteps || [],
    publicData: input.publicData || null,
    programId: input.programId || null,
    pda: input.pda || null,
    txSignature: input.txSignature || null,
    slot: input.slot ?? null,
    blockTime: input.blockTime ?? null,
    network: input.network || null,
    status: input.status || 'PENDING',
    failureReason: input.failureReason || null,
    anchoredAt: input.anchoredAt || new Date().toISOString(),
    createdAt: input.createdAt || new Date().toISOString(),
    metadata: input.metadata || null,
  };
}

export function validateSolanaProvenance(provenance) {
  const errors = [];

  if (!provenance || typeof provenance !== 'object') {
    return { valid: false, errors: ['Provenance must be an object'] };
  }

  for (const field of SOLANA_PROVENANCE_SCHEMA.required) {
    if (provenance[field] === undefined || provenance[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (
    provenance.processingHash &&
    !/^[a-f0-9]{64}$/.test(provenance.processingHash)
  ) {
    errors.push('processingHash must be a 64-character hexadecimal string');
  }

  if (
    provenance.signalHash &&
    !/^[a-f0-9]{64}$/.test(provenance.signalHash)
  ) {
    errors.push('signalHash must be a 64-character hexadecimal string');
  }

  const validStatuses = ['PENDING', 'SUBMITTED', 'CONFIRMED', 'FAILED'];
  if (provenance.status && !validStatuses.includes(provenance.status)) {
    errors.push(`Invalid status: ${provenance.status}`);
  }

  return { valid: errors.length === 0, errors };
}

export const SOLANA_PROVENANCE_FIELDS = Object.freeze(
  Object.keys(SOLANA_PROVENANCE_SCHEMA.properties),
);