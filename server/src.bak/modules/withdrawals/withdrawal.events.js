/**
 * Withdrawal Event Helpers
 *
 * @module signalforge/server/modules/withdrawals/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { WITHDRAWAL_EVENTS } from './withdrawal.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'withdrawals',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitWithdrawalRequested(userId, requestId, amount, purpose, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_REQUESTED, {
    userId,
    requestId,
    amount,
    purpose,
    requestedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitWithdrawalUnderReview(userId, requestId, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_UNDER_REVIEW, {
    userId,
    requestId,
    reviewedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitWithdrawalApproved(userId, requestId, actorId, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_APPROVED, {
    userId,
    requestId,
    actorId,
    approvedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitWithdrawalRejected(userId, requestId, actorId, reason, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_REJECTED, {
    userId,
    requestId,
    actorId,
    reason,
    rejectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitWithdrawalProcessing(userId, requestId, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_PROCESSING, {
    userId,
    requestId,
    processingAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitWithdrawalCompleted(userId, requestId, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_COMPLETED, {
    userId,
    requestId,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitWithdrawalFailed(userId, requestId, reason, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_FAILED, {
    userId,
    requestId,
    reason,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitWithdrawalCancelled(userId, requestId, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_CANCELLED, {
    userId,
    requestId,
    cancelledAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitWithdrawalMethodAdded(userId, accountId, methodType, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_METHOD_ADDED, {
    userId,
    accountId,
    methodType,
    addedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitWithdrawalMethodRemoved(userId, accountId, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_METHOD_REMOVED, {
    userId,
    accountId,
    removedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitWithdrawalMethodVerified(userId, accountId, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_METHOD_VERIFIED, {
    userId,
    accountId,
    verifiedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitWithdrawalLimitExceeded(userId, limitType, amount, limit, meta = {}) {
  return publish(WITHDRAWAL_EVENTS.WITHDRAWAL_LIMIT_EXCEEDED, {
    userId,
    limitType,
    amount,
    limit,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export { WITHDRAWAL_EVENTS };