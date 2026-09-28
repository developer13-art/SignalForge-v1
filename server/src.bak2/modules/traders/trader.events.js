/**
 * Trader Event Helpers
 *
 * @module signalforge/server/modules/traders/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { TRADER_EVENTS } = require('./trader.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'traders',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitTraderRegistered(traderId, userId, meta = {}) {
  return publish(TRADER_EVENTS.TRADER_REGISTERED, {
    traderId,
    userId,
    registeredAt: new Date().toISOString(),
    ...meta,
  });
}
function emitTraderUpdated(traderId, changes, meta = {}) {
  return publish(TRADER_EVENTS.TRADER_UPDATED, {
    traderId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitTraderApproved(traderId, actorId, meta = {}) {
  return publish(TRADER_EVENTS.TRADER_APPROVED, {
    traderId,
    actorId,
    approvedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitTraderSuspended(traderId, actorId, reason, meta = {}) {
  return publish(TRADER_EVENTS.TRADER_SUSPENDED, {
    traderId,
    actorId,
    reason,
    suspendedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitTraderReinstated(traderId, actorId, meta = {}) {
  return publish(TRADER_EVENTS.TRADER_REINSTATED, {
    traderId,
    actorId,
    reinstatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitTraderProfileUpdated(traderId, changes, meta = {}) {
  return publish(TRADER_EVENTS.TRADER_PROFILE_UPDATED, {
    traderId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitTraderAvatarUpdated(traderId, avatarUrl, meta = {}) {
  return publish(TRADER_EVENTS.TRADER_AVATAR_UPDATED, {
    traderId,
    avatarUrl,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitTraderAvatarRemoved(traderId, meta = {}) {
  return publish(TRADER_EVENTS.TRADER_AVATAR_REMOVED, {
    traderId,
    removedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitFollowerAdded(traderId, followerId, followerRecordId, meta = {}) {
  return publish(TRADER_EVENTS.FOLLOWER_ADDED, {
    traderId,
    followerId,
    followerRecordId,
    addedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitFollowerRemoved(traderId, followerId, meta = {}) {
  return publish(TRADER_EVENTS.FOLLOWER_REMOVED, {
    traderId,
    followerId,
    removedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitCopySettingsUpdated(traderId, followerId, changes, meta = {}) {
  return publish(TRADER_EVENTS.COPY_SETTINGS_UPDATED, {
    traderId,
    followerId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitLeaderboardRefreshed(metric, period, count, meta = {}) {
  return publish(TRADER_EVENTS.LEADERBOARD_REFRESHED, {
    metric,
    period,
    count,
    refreshedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitTraderRegistered = emitTraderRegistered;
module.exports.emitTraderUpdated = emitTraderUpdated;
module.exports.emitTraderApproved = emitTraderApproved;
module.exports.emitTraderSuspended = emitTraderSuspended;
module.exports.emitTraderReinstated = emitTraderReinstated;
module.exports.emitTraderProfileUpdated = emitTraderProfileUpdated;
module.exports.emitTraderAvatarUpdated = emitTraderAvatarUpdated;
module.exports.emitTraderAvatarRemoved = emitTraderAvatarRemoved;
module.exports.emitFollowerAdded = emitFollowerAdded;
module.exports.emitFollowerRemoved = emitFollowerRemoved;
module.exports.emitCopySettingsUpdated = emitCopySettingsUpdated;
module.exports.emitLeaderboardRefreshed = emitLeaderboardRefreshed;
