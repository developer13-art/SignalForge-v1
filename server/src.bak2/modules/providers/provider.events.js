/**
 * Provider Event Helpers
 *
 * @module signalforge/server/modules/providers/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { PROVIDER_EVENTS } = require('./provider.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'providers',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitProviderRegistered(providerId, userId, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_REGISTERED, {
    providerId,
    userId,
    registeredAt: new Date().toISOString(),
    ...meta,
  });
}
function emitProviderUpdated(providerId, changes, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_UPDATED, {
    providerId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitProviderApproved(providerId, actorId, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_APPROVED, {
    providerId,
    actorId,
    approvedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitProviderSuspended(providerId, actorId, reason, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_SUSPENDED, {
    providerId,
    actorId,
    reason,
    suspendedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitProviderReinstated(providerId, actorId, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_REINSTATED, {
    providerId,
    actorId,
    reinstatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitProviderCertified(providerId, certificationId, tier, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_CERTIFIED, {
    providerId,
    certificationId,
    tier,
    certifiedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitProviderUncertified(providerId, reason, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_UNCERTIFIED, {
    providerId,
    reason,
    uncertifiedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitProviderProfileUpdated(providerId, changes, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_PROFILE_UPDATED, {
    providerId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitProviderAvatarUpdated(providerId, avatarUrl, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_AVATAR_UPDATED, {
    providerId,
    avatarUrl,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitProviderAvatarRemoved(providerId, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_AVATAR_REMOVED, {
    providerId,
    removedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitProviderRevenueUpdated(providerId, period, summary, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_REVENUE_UPDATED, {
    providerId,
    period,
    summary,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitProviderSubscriberAdded(providerId, subscriberId, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_SUBSCRIBER_ADDED, {
    providerId,
    subscriberId,
    addedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitProviderSubscriberRemoved(providerId, subscriberId, meta = {}) {
  return publish(PROVIDER_EVENTS.PROVIDER_SUBSCRIBER_REMOVED, {
    providerId,
    subscriberId,
    removedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitCertificationStarted(providerId, certificationId, meta = {}) {
  return publish(PROVIDER_EVENTS.CERTIFICATION_STARTED, {
    providerId,
    certificationId,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitCertificationCompleted(providerId, certificationId, result, meta = {}) {
  return publish(PROVIDER_EVENTS.CERTIFICATION_COMPLETED, {
    providerId,
    certificationId,
    tier: result.tier,
    certifiedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitCertificationFailed(providerId, certificationId, reason, meta = {}) {
  return publish(PROVIDER_EVENTS.CERTIFICATION_FAILED, {
    providerId,
    certificationId,
    reason,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitCertificationExpired(providerId, certificationId, meta = {}) {
  return publish(PROVIDER_EVENTS.CERTIFICATION_EXPIRED, {
    providerId,
    certificationId,
    expiredAt: new Date().toISOString(),
    ...meta,
  });
}
function emitCertificationRevoked(providerId, certificationId, reason, meta = {}) {
  return publish(PROVIDER_EVENTS.CERTIFICATION_REVOKED, {
    providerId,
    certificationId,
    reason,
    revokedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitHistoricalImportStarted(providerId, certificationId, messageCount, meta = {}) {
  return publish(PROVIDER_EVENTS.HISTORICAL_IMPORT_STARTED, {
    providerId,
    certificationId,
    messageCount,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitHistoricalImportCompleted(providerId, certificationId, summary, meta = {}) {
  return publish(PROVIDER_EVENTS.HISTORICAL_IMPORT_COMPLETED, {
    providerId,
    certificationId,
    summary,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitBacktestCompleted(providerId, certificationId, summary, meta = {}) {
  return publish(PROVIDER_EVENTS.BACKTEST_COMPLETED, {
    providerId,
    certificationId,
    summary,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSandboxRunCompleted(providerId, certificationId, summary, meta = {}) {
  return publish(PROVIDER_EVENTS.SANDBOX_RUN_COMPLETED, {
    providerId,
    certificationId,
    summary,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPromotionCreated(providerId, promotionId, meta = {}) {
  return publish(PROVIDER_EVENTS.PROMOTION_CREATED, {
    providerId,
    promotionId,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPromotionUpdated(providerId, promotionId, changes, meta = {}) {
  return publish(PROVIDER_EVENTS.PROMOTION_UPDATED, {
    providerId,
    promotionId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPromotionDeleted(providerId, promotionId, meta = {}) {
  return publish(PROVIDER_EVENTS.PROMOTION_DELETED, {
    providerId,
    promotionId,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitProviderRegistered = emitProviderRegistered;
module.exports.emitProviderUpdated = emitProviderUpdated;
module.exports.emitProviderApproved = emitProviderApproved;
module.exports.emitProviderSuspended = emitProviderSuspended;
module.exports.emitProviderReinstated = emitProviderReinstated;
module.exports.emitProviderCertified = emitProviderCertified;
module.exports.emitProviderUncertified = emitProviderUncertified;
module.exports.emitProviderProfileUpdated = emitProviderProfileUpdated;
module.exports.emitProviderAvatarUpdated = emitProviderAvatarUpdated;
module.exports.emitProviderAvatarRemoved = emitProviderAvatarRemoved;
module.exports.emitProviderRevenueUpdated = emitProviderRevenueUpdated;
module.exports.emitProviderSubscriberAdded = emitProviderSubscriberAdded;
module.exports.emitProviderSubscriberRemoved = emitProviderSubscriberRemoved;
module.exports.emitCertificationStarted = emitCertificationStarted;
module.exports.emitCertificationCompleted = emitCertificationCompleted;
module.exports.emitCertificationFailed = emitCertificationFailed;
module.exports.emitCertificationExpired = emitCertificationExpired;
module.exports.emitCertificationRevoked = emitCertificationRevoked;
module.exports.emitHistoricalImportStarted = emitHistoricalImportStarted;
module.exports.emitHistoricalImportCompleted = emitHistoricalImportCompleted;
module.exports.emitBacktestCompleted = emitBacktestCompleted;
module.exports.emitSandboxRunCompleted = emitSandboxRunCompleted;
module.exports.emitPromotionCreated = emitPromotionCreated;
module.exports.emitPromotionUpdated = emitPromotionUpdated;
module.exports.emitPromotionDeleted = emitPromotionDeleted;
