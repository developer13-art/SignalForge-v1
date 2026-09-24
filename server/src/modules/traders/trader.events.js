/**
 * Trader Event Helpers
 *
 * @module signalforge/server/modules/traders/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { TRADER_EVENTS } from './trader.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'traders',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitTraderRegistered(traderId, userId, meta = {}) {
  return publish(TRADER_EVENTS.TRADER_REGISTERED, {
    traderId,
    userId,
    registeredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitTraderUpdated(traderId, changes, meta = {}) {
  return publish(TRADER_EVENTS.TRADER_UPDATED, {
    traderId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitTraderApproved(traderId, actorId, meta = {}) {
  return publish(TRADER_EVENTS.TRADER_APPROVED, {
    traderId,
    actorId,
    approvedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitTraderSuspended(traderId, actorId, reason, meta = {}) {
  return publish(TRADER_EVENTS.TRADER_SUSPENDED, {
    traderId,
    actorId,
    reason,
    suspendedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitTraderReinstated(traderId, actorId, meta = {}) {
  return publish(TRADER_EVENTS.TRADER_REINSTATED, {
    traderId,
    actorId,
    reinstatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitTraderProfileUpdated(traderId, changes, meta = {}) {
  return publish(TRADER_EVENTS.TRADER_PROFILE_UPDATED, {
    traderId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitTraderAvatarUpdated(traderId, avatarUrl, meta = {}) {
  return publish(TRADER_EVENTS.TRADER_AVATAR_UPDATED, {
    traderId,
    avatarUrl,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitTraderAvatarRemoved(traderId, meta = {}) {
  return publish(TRADER_EVENTS.TRADER_AVATAR_REMOVED, {
    traderId,
    removedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitFollowerAdded(traderId, followerId, followerRecordId, meta = {}) {
  return publish(TRADER_EVENTS.FOLLOWER_ADDED, {
    traderId,
    followerId,
    followerRecordId,
    addedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitFollowerRemoved(traderId, followerId, meta = {}) {
  return publish(TRADER_EVENTS.FOLLOWER_REMOVED, {
    traderId,
    followerId,
    removedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitCopySettingsUpdated(traderId, followerId, changes, meta = {}) {
  return publish(TRADER_EVENTS.COPY_SETTINGS_UPDATED, {
    traderId,
    followerId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitLeaderboardRefreshed(metric, period, count, meta = {}) {
  return publish(TRADER_EVENTS.LEADERBOARD_REFRESHED, {
    metric,
    period,
    count,
    refreshedAt: new Date().toISOString(),
    ...meta,
  });
}

export { TRADER_EVENTS };