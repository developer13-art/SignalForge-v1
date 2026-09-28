/**
 * Withdrawal Event Helpers
 *
 * @module signalforge/server/modules/withdrawals/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { WITHDRAWAL_EVENTS } = require('./withdrawal.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'withdrawals',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitWithdrawalRequested(userId, requestId, amount, purpose, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_REQUESTED, {
    userId,
    requestId,
    amount,
    purpose,
    requestedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWithdrawalUnderReview(userId, requestId, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_UNDER_REVIEW, {
    userId,
    requestId,
    reviewedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWithdrawalApproved(userId, requestId, actorId, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_APPROVED, {
    userId,
    requestId,
    actorId,
    approvedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWithdrawalRejected(userId, requestId, actorId, reason, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_REJECTED, {
    userId,
    requestId,
    actorId,
    reason,
    rejectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWithdrawalProcessing(userId, requestId, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_PROCESSING, {
    userId,
    requestId,
    processingAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWithdrawalCompleted(userId, requestId, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_COMPLETED, {
    userId,
    requestId,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWithdrawalFailed(userId, requestId, reason, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_FAILED, {
    userId,
    requestId,
    reason,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWithdrawalCancelled(userId, requestId, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_CANCELLED, {
    userId,
    requestId,
    cancelledAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWithdrawalMethodAdded(userId, accountId, methodType, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_METHOD_ADDED, {
    userId,
    accountId,
    methodType,
    addedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWithdrawalMethodRemoved(userId, accountId, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_METHOD_REMOVED, {
    userId,
    accountId,
    removedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWithdrawalMethodVerified(userId, accountId, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_METHOD_VERIFIED, {
    userId,
    accountId,
    verifiedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWithdrawalLimitExceeded(userId, limitType, amount, limit, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_LIMIT_EXCEEDED, {
    userId,
    limitType,
    amount,
    limit,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitWithdrawalRequested = emitWithdrawalRequested;
module.exports.emitWithdrawalUnderReview = emitWithdrawalUnderReview;
module.exports.emitWithdrawalApproved = emitWithdrawalApproved;
module.exports.emitWithdrawalRejected = emitWithdrawalRejected;
module.exports.emitWithdrawalProcessing = emitWithdrawalProcessing;
module.exports.emitWithdrawalCompleted = emitWithdrawalCompleted;
module.exports.emitWithdrawalFailed = emitWithdrawalFailed;
module.exports.emitWithdrawalCancelled = emitWithdrawalCancelled;
module.exports.emitWithdrawalMethodAdded = emitWithdrawalMethodAdded;
module.exports.emitWithdrawalMethodRemoved = emitWithdrawalMethodRemoved;
module.exports.emitWithdrawalMethodVerified = emitWithdrawalMethodVerified;
module.exports.emitWithdrawalLimitExceeded = emitWithdrawalLimitExceeded;
