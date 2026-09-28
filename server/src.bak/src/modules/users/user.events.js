/**
 * User Event Helpers
 *
 * @module signalforge/server/modules/users/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { USER_EVENTS } = require('./user.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'users',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitUserUpdated(userId, changes, meta = {}) {
  return publish(USER_EVENTS.USER_UPDATED, {
    userId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitProfileUpdated(userId, profileId, meta = {}) {
  return publish(USER_EVENTS.PROFILE_UPDATED, {
    userId,
    profileId,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPreferencesUpdated(userId, meta = {}) {
  return publish(USER_EVENTS.PREFERENCES_UPDATED, {
    userId,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitAvatarUpdated(userId, avatarUrl, meta = {}) {
  return publish(USER_EVENTS.AVATAR_UPDATED, {
    userId,
    avatarUrl,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitAvatarRemoved(userId, meta = {}) {
  return publish(USER_EVENTS.AVATAR_REMOVED, {
    userId,
    removedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSessionRevoked(userId, sessionId, reason, meta = {}) {
  return publish(USER_EVENTS.SESSION_REVOKED, {
    userId,
    sessionId,
    reason,
    revokedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitDeviceRemoved(userId, deviceId, meta = {}) {
  return publish(USER_EVENTS.DEVICE_REMOVED, {
    userId,
    deviceId,
    removedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitApiKeyCreated(userId, apiKeyId, name, meta = {}) {
  return publish(USER_EVENTS.API_KEY_CREATED, {
    userId,
    apiKeyId,
    name,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitApiKeyRevoked(userId, apiKeyId, meta = {}) {
  return publish(USER_EVENTS.API_KEY_REVOKED, {
    userId,
    apiKeyId,
    revokedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitAccountDeactivated(userId, meta = {}) {
  return publish(USER_EVENTS.ACCOUNT_DEACTIVATED, {
    userId,
    deactivatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitAccountReactivated(userId, meta = {}) {
  return publish(USER_EVENTS.ACCOUNT_REACTIVATED, {
    userId,
    reactivatedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitUserUpdated = emitUserUpdated;
module.exports.emitProfileUpdated = emitProfileUpdated;
module.exports.emitPreferencesUpdated = emitPreferencesUpdated;
module.exports.emitAvatarUpdated = emitAvatarUpdated;
module.exports.emitAvatarRemoved = emitAvatarRemoved;
module.exports.emitSessionRevoked = emitSessionRevoked;
module.exports.emitDeviceRemoved = emitDeviceRemoved;
module.exports.emitApiKeyCreated = emitApiKeyCreated;
module.exports.emitApiKeyRevoked = emitApiKeyRevoked;
module.exports.emitAccountDeactivated = emitAccountDeactivated;
module.exports.emitAccountReactivated = emitAccountReactivated;
