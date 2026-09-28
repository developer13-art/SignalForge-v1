'use strict';

/**
 * SignalForge - Proof of Alpha Status Constants
 */

const PROOF_STATUSES = Object.freeze({
  PENDING: 'pending',
  SUBMITTING: 'submitting',
  SUBMITTED: 'submitted',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  EXPIRED: 'expired',
});

const PROOF_STATUS_LABELS = Object.freeze({
  pending: 'Pending',
  submitting: 'Submitting',
  submitted: 'Submitted',
  confirmed: 'Confirmed',
  failed: 'Failed',
  expired: 'Expired',
});

const PROOF_STATUS_COLORS = Object.freeze({
  pending: 'slate',
  submitting: 'sky',
  submitted: 'sky',
  confirmed: 'emerald',
  failed: 'rose',
  expired: 'amber',
});

const PROOF_TERMINAL_STATUSES = Object.freeze(['confirmed', 'failed', 'expired']);

const PROOF_PENDING_STATUSES = Object.freeze(['pending', 'submitting', 'submitted']);

function isTerminal(status) {
  return PROOF_TERMINAL_STATUSES.includes(status);
}

function isPending(status) {
  return PROOF_PENDING_STATUSES.includes(status);
}

module.exports = Object.freeze({
  PROOF_STATUSES,
  PROOF_STATUS_LABELS,
  PROOF_STATUS_COLORS,
  PROOF_TERMINAL_STATUSES,
  PROOF_PENDING_STATUSES,
  isTerminal,
  isPending,
});