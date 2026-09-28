/**
 * Referral Event Helpers
 *
 * @module signalforge/server/modules/referrals/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { REFERRAL_EVENTS } = require('./referral.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'referrals',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitCodeCreated(userId, codeId, code, meta = {}) {
  return publish(REFERRAL_EVENTS.CODE_CREATED, {
    userId,
    codeId,
    code,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitCodeRegenerated(userId, codeId, previousCode, newCode, meta = {}) {
  return publish(REFERRAL_EVENTS.CODE_REGENERATED, {
    userId,
    codeId,
    previousCode,
    newCode,
    regeneratedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRelationshipCreated(referrerId, referredUserId, relationshipId, meta = {}) {
  return publish(REFERRAL_EVENTS.RELATIONSHIP_CREATED, {
    referrerId,
    referredUserId,
    relationshipId,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRelationshipSuspended(referrerId, referredUserId, reason, meta = {}) {
  return publish(REFERRAL_EVENTS.RELATIONSHIP_SUSPENDED, {
    referrerId,
    referredUserId,
    reason,
    suspendedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRelationshipTerminated(referrerId, referredUserId, reason, meta = {}) {
  return publish(REFERRAL_EVENTS.RELATIONSHIP_TERMINATED, {
    referrerId,
    referredUserId,
    reason,
    terminatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRewardCalculated(referrerId, rewardId, amount, settlementPeriod, meta = {}) {
  return publish(REFERRAL_EVENTS.REWARD_CALCULATED, {
    referrerId,
    rewardId,
    amount,
    settlementPeriod,
    calculatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRewardApproved(referrerId, rewardId, actorId, meta = {}) {
  return publish(REFERRAL_EVENTS.REWARD_APPROVED, {
    referrerId,
    rewardId,
    actorId,
    approvedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRewardRejected(referrerId, rewardId, actorId, reason, meta = {}) {
  return publish(REFERRAL_EVENTS.REWARD_REJECTED, {
    referrerId,
    rewardId,
    actorId,
    reason,
    rejectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRewardSettled(referrerId, rewardId, amount, ledgerEntryId, meta = {}) {
  return publish(REFERRAL_EVENTS.REWARD_SETTLED, {
    referrerId,
    rewardId,
    amount,
    ledgerEntryId,
    settledAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRewardReversed(referrerId, rewardId, reason, meta = {}) {
  return publish(REFERRAL_EVENTS.REWARD_REVERSED, {
    referrerId,
    rewardId,
    reason,
    reversedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRewardUnderReview(referrerId, rewardId, fraudFlags, meta = {}) {
  return publish(REFERRAL_EVENTS.REWARD_UNDER_REVIEW, {
    referrerId,
    rewardId,
    fraudFlags,
    flaggedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSettlementStarted(settlementId, settlementPeriod, meta = {}) {
  return publish(REFERRAL_EVENTS.SETTLEMENT_STARTED, {
    settlementId,
    settlementPeriod,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSettlementCompleted(settlementId, settlementPeriod, summary, meta = {}) {
  return publish(REFERRAL_EVENTS.SETTLEMENT_COMPLETED, {
    settlementId,
    settlementPeriod,
    summary,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSettlementFailed(settlementId, settlementPeriod, error, meta = {}) {
  return publish(REFERRAL_EVENTS.SETTLEMENT_FAILED, {
    settlementId,
    settlementPeriod,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWalletCredited(userId, walletId, amount, balanceAfter, meta = {}) {
  return publish(REFERRAL_EVENTS.WALLET_CREDITED, {
    userId,
    walletId,
    amount,
    balanceAfter,
    creditedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWalletDebited(userId, walletId, amount, balanceAfter, meta = {}) {
  return publish(REFERRAL_EVENTS.WALLET_DEBITED, {
    userId,
    walletId,
    amount,
    balanceAfter,
    debitedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitLedgerEntryCreated(userId, walletId, entryId, direction, amount, meta = {}) {
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
function emitFraudFlagRaised(referrerId, flagId, flagType, severity, meta = {}) {
  return publish(REFERRAL_EVENTS.FRAUD_FLAG_RAISED, {
    referrerId,
    flagId,
    flagType,
    severity,
    raisedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitFraudReviewAssigned(flagId, reviewerId, meta = {}) {
  return publish(REFERRAL_EVENTS.FRAUD_REVIEW_ASSIGNED, {
    flagId,
    reviewerId,
    assignedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitFraudReviewResolved(flagId, resolution, meta = {}) {
  return publish(REFERRAL_EVENTS.FRAUD_REVIEW_RESOLVED, {
    flagId,
    resolution,
    resolvedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitCodeCreated = emitCodeCreated;
module.exports.emitCodeRegenerated = emitCodeRegenerated;
module.exports.emitRelationshipCreated = emitRelationshipCreated;
module.exports.emitRelationshipSuspended = emitRelationshipSuspended;
module.exports.emitRelationshipTerminated = emitRelationshipTerminated;
module.exports.emitRewardCalculated = emitRewardCalculated;
module.exports.emitRewardApproved = emitRewardApproved;
module.exports.emitRewardRejected = emitRewardRejected;
module.exports.emitRewardSettled = emitRewardSettled;
module.exports.emitRewardReversed = emitRewardReversed;
module.exports.emitRewardUnderReview = emitRewardUnderReview;
module.exports.emitSettlementStarted = emitSettlementStarted;
module.exports.emitSettlementCompleted = emitSettlementCompleted;
module.exports.emitSettlementFailed = emitSettlementFailed;
module.exports.emitWalletCredited = emitWalletCredited;
module.exports.emitWalletDebited = emitWalletDebited;
module.exports.emitLedgerEntryCreated = emitLedgerEntryCreated;
module.exports.emitFraudFlagRaised = emitFraudFlagRaised;
module.exports.emitFraudReviewAssigned = emitFraudReviewAssigned;
module.exports.emitFraudReviewResolved = emitFraudReviewResolved;
