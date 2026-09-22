/**
 * Solana Attestation Types
 *
 * Defines the types of attestations that SignalForge anchors on Solana.
 * Attestations are used for on-chain provider reputation and signal
 * provenance. Sensitive data is never stored on-chain; only hashes,
 * identifiers, and public reputation values are anchored.
 *
 * @module @signalforge/shared/constants/solana-attestation-types
 */

export const SOLANA_ATTESTATION_TYPES = Object.freeze({
  PROVIDER_CERTIFICATION: 'PROVIDER_CERTIFICATION',
  PROVIDER_DNA: 'PROVIDER_DNA',
  PROVIDER_REPUTATION: 'PROVIDER_REPUTATION',
  SIGNAL_PROVENANCE: 'SIGNAL_PROVENANCE',
  TRADE_PROVENANCE: 'TRADE_PROVENANCE',
  CONSENSUS_RECORD: 'CONSENSUS_RECORD',
});

export const SOLANA_ATTESTATION_TYPE_VALUES = Object.freeze(
  Object.values(SOLANA_ATTESTATION_TYPES),
);

export const SOLANA_ATTESTATION_TYPE_LABELS = Object.freeze({
  [SOLANA_ATTESTATION_TYPES.PROVIDER_CERTIFICATION]: 'Provider Certification',
  [SOLANA_ATTESTATION_TYPES.PROVIDER_DNA]: 'Provider DNA',
  [SOLANA_ATTESTATION_TYPES.PROVIDER_REPUTATION]: 'Provider Reputation',
  [SOLANA_ATTESTATION_TYPES.SIGNAL_PROVENANCE]: 'Signal Provenance',
  [SOLANA_ATTESTATION_TYPES.TRADE_PROVENANCE]: 'Trade Provenance',
  [SOLANA_ATTESTATION_TYPES.CONSENSUS_RECORD]: 'Consensus Record',
});

export const SOLANA_ATTESTATION_PUBLIC_FIELDS = Object.freeze({
  [SOLANA_ATTESTATION_TYPES.PROVIDER_CERTIFICATION]: [
    'provider_id',
    'certification_status',
    'certification_version',
    'verified_at',
  ],
  [SOLANA_ATTESTATION_TYPES.PROVIDER_DNA]: [
    'provider_id',
    'dna_confidence',
    'dna_version',
    'verified_at',
  ],
  [SOLANA_ATTESTATION_TYPES.PROVIDER_REPUTATION]: [
    'provider_id',
    'consistency_score',
    'performance_score',
    'verified_at',
  ],
  [SOLANA_ATTESTATION_TYPES.SIGNAL_PROVENANCE]: [
    'signal_id',
    'processing_hash',
    'ai_version',
    'provider_id',
    'anchored_at',
  ],
  [SOLANA_ATTESTATION_TYPES.TRADE_PROVENANCE]: [
    'trade_id',
    'signal_id',
    'processing_hash',
    'anchored_at',
  ],
  [SOLANA_ATTESTATION_TYPES.CONSENSUS_RECORD]: [
    'signal_id',
    'consensus_result',
    'participant_count',
    'anchored_at',
  ],
});

export const SOLANA_ATTESTATION_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED',
  REVOKED: 'REVOKED',
});

export const SOLANA_ATTESTATION_STATUS_VALUES = Object.freeze(
  Object.values(SOLANA_ATTESTATION_STATUSES),
);

export const SOLANA_ATTESTATION_STATUS_LABELS = Object.freeze({
  [SOLANA_ATTESTATION_STATUSES.PENDING]: 'Pending',
  [SOLANA_ATTESTATION_STATUSES.SUBMITTED]: 'Submitted',
  [SOLANA_ATTESTATION_STATUSES.CONFIRMED]: 'Confirmed',
  [SOLANA_ATTESTATION_STATUSES.FAILED]: 'Failed',
  [SOLANA_ATTESTATION_STATUSES.REVOKED]: 'Revoked',
});

export function isValidAttestationType(type) {
  return SOLANA_ATTESTATION_TYPE_VALUES.includes(type);
}

export function isValidAttestationStatus(status) {
  return SOLANA_ATTESTATION_STATUS_VALUES.includes(status);
}