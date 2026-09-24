/**
 * Provider Event Helpers
 *
 * @module signalforge/server/modules/providers/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { PROVIDER_EVENTS } from './provider.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'providers',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitProviderRegistered(providerId, userId, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_REGISTERED, {
    providerId,
    userId,
    registeredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitProviderUpdated(providerId, changes, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_UPDATED, {
    providerId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitProviderApproved(providerId, actorId, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_APPROVED, {
    providerId,
    actorId,
    approvedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitProviderSuspended(providerId, actorId, reason, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_SUSPENDED, {
    providerId,
    actorId,
    reason,
    suspendedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitProviderReinstated(providerId, actorId, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_REINSTATED, {
    providerId,
    actorId,
    reinstatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitProviderCertified(providerId, certificationId, tier, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_CERTIFIED, {
    providerId,
    certificationId,
    tier,
    certifiedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitProviderUncertified(providerId, reason, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_UNCERTIFIED, {
    providerId,
    reason,
    uncertifiedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitProviderProfileUpdated(providerId, changes, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_PROFILE_UPDATED, {
    providerId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitProviderAvatarUpdated(providerId, avatarUrl, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_AVATAR_UPDATED, {
    providerId,
    avatarUrl,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitProviderAvatarRemoved(providerId, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_AVATAR_REMOVED, {
    providerId,
    removedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitProviderRevenueUpdated(providerId, period, summary, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_REVENUE_UPDATED, {
    providerId,
    period,
    summary,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitProviderSubscriberAdded(providerId, subscriberId, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_SUBSCRIBER_ADDED, {
    providerId,
    subscriberId,
    addedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitProviderSubscriberRemoved(providerId, subscriberId, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_SUBSCRIBER_REMOVED, {
    providerId,
    subscriberId,
    removedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitCertificationStarted(providerId, certificationId, meta = {}) {
  return publish(PROVIDER_EVENTS.CERTIFICATION_STARTED, {
    providerId,
    certificationId,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitCertificationCompleted(providerId, certificationId, result, meta = {}) {
  return publish(PROVIDER_EVENTS.CERTIFICATION_COMPLETED, {
    providerId,
    certificationId,
    tier: result.tier,
    certifiedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitCertificationFailed(providerId, certificationId, reason, meta = {}) {
  return publish(PROVIDER_EVENTS.CERTIFICATION_FAILED, {
    providerId,
    certificationId,
    reason,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitCertificationExpired(providerId, certificationId, meta = {}) {
  return publish(PROVIDER_EVENTS.CERTIFICATION_EXPIRED, {
    providerId,
    certificationId,
    expiredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitCertificationRevoked(providerId, certificationId, reason, meta = {}) {
  return publish(PROVIDER_EVENTS.CERTIFICATION_REVOKED, {
    providerId,
    certificationId,
    reason,
    revokedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitHistoricalImportStarted(providerId, certificationId, messageCount, meta = {}) {
  return publish(PROVIDER_EVENTS.HISTORICAL_IMPORT_STARTED, {
    providerId,
    certificationId,
    messageCount,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitHistoricalImportCompleted(providerId, certificationId, summary, meta = {}) {
  return publish(PROVIDER_EVENTS.HISTORICAL_IMPORT_COMPLETED, {
    providerId,
    certificationId,
    summary,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitBacktestCompleted(providerId, certificationId, summary, meta = {}) {
  return publish(PROVIDER_EVENTS.BACKTEST_COMPLETED, {
    providerId,
    certificationId,
    summary,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSandboxRunCompleted(providerId, certificationId, summary, meta = {}) {
  return publish(PROVIDER_EVENTS.SANDBOX_RUN_COMPLETED, {
    providerId,
    certificationId,
    summary,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPromotionCreated(providerId, promotionId, meta = {}) {
  return publish(PROVIDER_EVENTS.PROMOTION_CREATED, {
    providerId,
    promotionId,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPromotionUpdated(providerId, promotionId, changes, meta = {}) {
  return publish(PROVIDER_EVENTS.PROMOTION_UPDATED, {
    providerId,
    promotionId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPromotionDeleted(providerId, promotionId, meta = {}) {
  return publish(PROVIDER_EVENTS.PROMOTION_DELETED, {
    providerId,
    promotionId,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}

export { PROVIDER_EVENTS };