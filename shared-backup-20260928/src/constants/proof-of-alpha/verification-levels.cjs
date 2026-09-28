'use strict';

/**
 * SignalForge - Proof of Alpha Verification Level Constants
 */

const PROOF_VERIFICATION_LEVELS = Object.freeze({
  UNVERIFIED: 'unverified',
  PARTIAL: 'partial',
  VERIFIED: 'verified',
  ON_CHAIN_CONFIRMED: 'on_chain_confirmed',
});

const PROOF_VERIFICATION_LABELS = Object.freeze({
  unverified: 'Unverified',
  partial: 'Partial',
  verified: 'Verified',
  on_chain_confirmed: 'Verified On-Chain',
});

const PROOF_VERIFICATION_DESCRIPTIONS = Object.freeze({
  unverified: 'No verification has been performed for this record.',
  partial: 'A memo was observed on-chain but does not fully match the recorded proof.',
  verified: 'A memo was observed and parsed but is not yet linked to an internal proof.',
  on_chain_confirmed:
    'The on-chain memo matches the recorded proof and the signature is confirmed.',
});

const PROOF_VERIFICATION_BADGE_COLORS = Object.freeze({
  unverified: 'slate',
  partial: 'amber',
  verified: 'sky',
  on_chain_confirmed: 'emerald',
});

function isOnChainConfirmed(level) {
  return level === PROOF_VERIFICATION_LEVELS.ON_CHAIN_CONFIRMED;
}

function isTrusted(level) {
  return [PROOF_VERIFICATION_LEVELS.VERIFIED, PROOF_VERIFICATION_LEVELS.ON_CHAIN_CONFIRMED].includes(
    level,
  );
}

module.exports = Object.freeze({
  PROOF_VERIFICATION_LEVELS,
  PROOF_VERIFICATION_LABELS,
  PROOF_VERIFICATION_DESCRIPTIONS,
  PROOF_VERIFICATION_BADGE_COLORS,
  isOnChainConfirmed,
  isTrusted,
});