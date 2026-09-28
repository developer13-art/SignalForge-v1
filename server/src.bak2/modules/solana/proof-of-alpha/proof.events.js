'use strict';

/**
 * SignalForge - Proof of Alpha Event Definitions
 *
 * Centralizes the event names emitted by the Proof of Alpha subsystem
 * so that downstream consumers subscribe to stable, versioned names.
 */

const PROOF_EVENT_NAMES = Object.freeze({
  PROOF_REQUESTED: 'solana.proof.requested',
  PROOF_MEMO_BUILT: 'solana.proof.memo.built',
  PROOF_MEMO_SUBMITTED: 'solana.proof.memo.submitted',
  PROOF_MEMO_CONFIRMED: 'solana.proof.memo.confirmed',
  PROOF_MEMO_FAILED: 'solana.proof.memo.failed',
  PROOF_VERIFICATION_STARTED: 'solana.proof.verification.started',
  PROOF_VERIFICATION_COMPLETED: 'solana.proof.verification.completed',
  PROOF_VERIFICATION_FAILED: 'solana.proof.verification.failed',
  PROOF_LEADERBOARD_REFRESHED: 'solana.proof.leaderboard.refreshed',
  PROOF_LEADERBOARD_CACHE_HIT: 'solana.proof.leaderboard.cache_hit',
  PROOF_PROVIDER_CERTIFIED: 'solana.proof.provider.certified',
  PROOF_MILESTONE_REACHED: 'solana.proof.milestone.reached',
});

const PROOF_EVENT_VERSION = 1;

function buildEventEnvelope(name, payload, metadata = {}) {
  return {
    name,
    version: PROOF_EVENT_VERSION,
    emittedAt: new Date().toISOString(),
    payload,
    metadata: {
      source: 'proof-of-alpha',
      ...metadata,
    },
  };
}

function buildProofRequestedEvent({ providerId, tradeId, kind, requestId }) {
  return buildEventEnvelope(PROOF_EVENT_NAMES.PROOF_REQUESTED, {
    providerId,
    tradeId: tradeId || null,
    kind,
    requestId: requestId || null,
  });
}

function buildMemoBuiltEvent({ providerId, tradeId, memoLength, requestId }) {
  return buildEventEnvelope(PROOF_EVENT_NAMES.PROOF_MEMO_BUILT, {
    providerId,
    tradeId: tradeId || null,
    memoLength,
    requestId: requestId || null,
  });
}

function buildMemoSubmittedEvent({ providerId, tradeId, signature, reference, requestId }) {
  return buildEventEnvelope(PROOF_EVENT_NAMES.PROOF_MEMO_SUBMITTED, {
    providerId,
    tradeId,
    signature,
    reference: reference || null,
    requestId: requestId || null,
  });
}

function buildMemoConfirmedEvent({ providerId, tradeId, signature, blockSlot, requestId }) {
  return buildEventEnvelope(PROOF_EVENT_NAMES.PROOF_MEMO_CONFIRMED, {
    providerId,
    tradeId,
    signature,
    blockSlot: blockSlot || null,
    requestId: requestId || null,
  });
}

function buildMemoFailedEvent({ providerId, tradeId, signature, reason, requestId }) {
  return buildEventEnvelope(PROOF_EVENT_NAMES.PROOF_MEMO_FAILED, {
    providerId,
    tradeId: tradeId || null,
    signature: signature || null,
    reason,
    requestId: requestId || null,
  });
}

function buildVerificationStartedEvent({ signature, providerId, requestId }) {
  return buildEventEnvelope(PROOF_EVENT_NAMES.PROOF_VERIFICATION_STARTED, {
    signature,
    providerId: providerId || null,
    requestId: requestId || null,
  });
}

function buildVerificationCompletedEvent({ signature, providerId, valid, requestId }) {
  return buildEventEnvelope(PROOF_EVENT_NAMES.PROOF_VERIFICATION_COMPLETED, {
    signature,
    providerId: providerId || null,
    valid,
    requestId: requestId || null,
  });
}

function buildVerificationFailedEvent({ signature, providerId, reason, requestId }) {
  return buildEventEnvelope(PROOF_EVENT_NAMES.PROOF_VERIFICATION_FAILED, {
    signature,
    providerId: providerId || null,
    reason,
    requestId: requestId || null,
  });
}

function buildLeaderboardRefreshedEvent({ window, count, sortBy, requestId }) {
  return buildEventEnvelope(PROOF_EVENT_NAMES.PROOF_LEADERBOARD_REFRESHED, {
    window,
    count,
    sortBy: sortBy || null,
    requestId: requestId || null,
  });
}

function buildProviderCertifiedEvent({ providerId, signature, qualityScore, requestId }) {
  return buildEventEnvelope(PROOF_EVENT_NAMES.PROOF_PROVIDER_CERTIFIED, {
    providerId,
    signature: signature || null,
    qualityScore,
    requestId: requestId || null,
  });
}

function buildMilestoneReachedEvent({ providerId, milestoneKey, signature, requestId }) {
  return buildEventEnvelope(PROOF_EVENT_NAMES.PROOF_MILESTONE_REACHED, {
    providerId,
    milestoneKey,
    signature: signature || null,
    requestId: requestId || null,
  });
}

module.exports = {
  PROOF_EVENT_NAMES,
  PROOF_EVENT_VERSION,
  buildEventEnvelope,
  buildProofRequestedEvent,
  buildMemoBuiltEvent,
  buildMemoSubmittedEvent,
  buildMemoConfirmedEvent,
  buildMemoFailedEvent,
  buildVerificationStartedEvent,
  buildVerificationCompletedEvent,
  buildVerificationFailedEvent,
  buildLeaderboardRefreshedEvent,
  buildProviderCertifiedEvent,
  buildMilestoneReachedEvent,
};