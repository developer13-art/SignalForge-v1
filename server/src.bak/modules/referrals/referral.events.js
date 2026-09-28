/**
 * Referral Event Helpers
 *
 * @module signalforge/server/modules/referrals/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { REFERRAL_EVENTS } from './referral.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'referrals',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitCodeCreated(userId, codeId, code, meta = {}) {
  return publish(REFERRAL_EVENTS.CODE_CREATED, {
    userId,
    codeId,
    code,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitCodeRegenerated(userId, codeId, previousCode, newCode, meta = {}) {
  return publish(REFERRAL_EVENTS.CODE_REGENERATED, {
    userId,
    codeId,
    previousCode,
    newCode,
    regeneratedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRelationshipCreated(referrerId, referredUserId, relationshipId, meta = {}) {
  return publish(REFERRAL_EVENTS.RELATIONSHIP_CREATED, {
    referrerId,
    referredUserId,
    relationshipId,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRelationshipSuspended(referrerId, referredUserId, reason, meta = {}) {
  return publish(REFERRAL_EVENTS.RELATIONSHIP_SUSPENDED, {
    referrerId,
    referredUserId,
    reason,
    suspendedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRelationshipTerminated(referrerId, referredUserId, reason, meta = {}) {
  return publish(REFERRAL_EVENTS.RELATIONSHIP_TERMINATED, {
    referrerId,
    referredUserId,
    reason,
    terminatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRewardCalculated(referrerId, rewardId, amount, settlementPeriod, meta = {}) {
  return publish(REFERRAL_EVENTS.REWARD_CALCULATED, {
    referrerId,
    rewardId,
    amount,
    settlementPeriod,
    calculatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRewardApproved(referrerId, rewardId, actorId, meta = {}) {
  return publish(REFERRAL_EVENTS.REWARD_APPROVED, {
    referrerId,
    rewardId,
    actorId,
    approvedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRewardRejected(referrerId, rewardId, actorId, reason, meta = {}) {
  return publish(REFERRAL_EVENTS.REWARD_REJECTED, {
    referrerId,
    rewardId,
    actorId,
    reason,
    rejectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRewardSettled(referrerId, rewardId, amount, ledgerEntryId, meta = {}) {
  return publish(REFERRAL_EVENTS.REWARD_SETTLED, {
    referrerId,
    rewardId,
    amount,
    ledgerEntryId,
    settledAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRewardReversed(referrerId, rewardId, reason, meta = {}) {
  return publish(REFERRAL_EVENTS.REWARD_REVERSED, {
    referrerId,
    rewardId,
    reason,
    reversedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRewardUnderReview(referrerId, rewardId, fraudFlags, meta = {}) {
  return publish(REFERRAL_EVENTS.REWARD_UNDER_REVIEW, {
    referrerId,
    rewardId,
    fraudFlags,
    flaggedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSettlementStarted(settlementId, settlementPeriod, meta = {}) {
  return publish(REFERRAL_EVENTS.SETTLEMENT_STARTED, {
    settlementId,
    settlementPeriod,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSettlementCompleted(settlementId, settlementPeriod, summary, meta = {}) {
  return publish(REFERRAL_EVENTS.SETTLEMENT_COMPLETED, {
    settlementId,
    settlementPeriod,
    summary,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSettlementFailed(settlementId, settlementPeriod, error, meta = {}) {
  return publish(REFERRAL_EVENTS.SETTLEMENT_FAILED, {
    settlementId,
    settlementPeriod,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitWalletCredited(userId, walletId, amount, balanceAfter, meta = {}) {
  return publish(REFERRAL_EVENTS.WALLET_CREDITED, {
    userId,
    walletId,
    amount,
    balanceAfter,
    creditedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitWalletDebited(userId, walletId, amount, balanceAfter, meta = {}) {
  return publish(REFERRAL_EVENTS.WALLET_DEBITED, {
    userId,
    walletId,
    amount,
    balanceAfter,
    debitedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitLedgerEntryCreated(userId, walletId, entryId, direction, amount, meta = {}) {
  return publish(REFERRAL_EVENTS.LEDGER_ENTRY_CREATED, {
    userId,
    walletId,
    entryId,
    direction,
    amount,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitFraudFlagRaised(referrerId, flagId, flagType, severity, meta = {}) {
  return publish(REFERRAL_EVENTS.FRAUD_FLAG_RAISED, {
    referrerId,
    flagId,
    flagType,
    severity,
    raisedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitFraudReviewAssigned(flagId, reviewerId, meta = {}) {
  return publish(REFERRAL_EVENTS.FRAUD_REVIEW_ASSIGNED, {
    flagId,
    reviewerId,
    assignedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitFraudReviewResolved(flagId, resolution, meta = {}) {
  return publish(REFERRAL_EVENTS.FRAUD_REVIEW_RESOLVED, {
    flagId,
    resolution,
    resolvedAt: new Date().toISOString(),
    ...meta,
  });
}

export { REFERRAL_EVENTS };