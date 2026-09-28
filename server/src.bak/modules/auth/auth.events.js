/**
 * Auth Event Definitions
 *
 * Provides typed helpers for publishing authentication-related events
 * on the platform Event Bus.
 *
 * @module signalforge/server/modules/auth/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { AUTH_EVENTS } from './auth.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'auth',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitUserRegistered(user, meta = {}) {
  return publish(AUTH_EVENTS.USER_REGISTERED, {
    userId: user.id,
    email: user.email,
    username: user.username || null,
    registeredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitUserLoggedIn(userId, sessionId, meta = {}) {
  return publish(AUTH_EVENTS.USER_LOGGED_IN, {
    userId,
    sessionId,
    loggedInAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitUserLoggedOut(userId, sessionId, meta = {}) {
  return publish(AUTH_EVENTS.USER_LOGGED_OUT, {
    userId,
    sessionId,
    loggedOutAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitLoginFailed(email, reason, meta = {}) {
  return publish(AUTH_EVENTS.LOGIN_FAILED, {
    email,
    reason,
    attemptedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitAccountLocked(userId, lockedUntil, meta = {}) {
  return publish(AUTH_EVENTS.ACCOUNT_LOCKED, {
    userId,
    lockedUntil,
    lockedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPasswordResetRequested(userId, meta = {}) {
  return publish(AUTH_EVENTS.PASSWORD_RESET_REQUESTED, {
    userId,
    requestedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPasswordResetCompleted(userId, meta = {}) {
  return publish(AUTH_EVENTS.PASSWORD_RESET_COMPLETED, {
    userId,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPasswordChanged(userId, meta = {}) {
  return publish(AUTH_EVENTS.PASSWORD_CHANGED, {
    userId,
    changedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitEmailVerificationSent(userId, email, meta = {}) {
  return publish(AUTH_EVENTS.EMAIL_VERIFICATION_SENT, {
    userId,
    email,
    sentAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitEmailVerified(userId, meta = {}) {
  return publish(AUTH_EVENTS.EMAIL_VERIFIED, {
    userId,
    verifiedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPhoneVerificationSent(userId, phone, meta = {}) {
  return publish(AUTH_EVENTS.PHONE_VERIFICATION_SENT, {
    userId,
    phone,
    sentAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPhoneVerified(userId, meta = {}) {
  return publish(AUTH_EVENTS.PHONE_VERIFIED, {
    userId,
    verifiedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitTwoFactorEnabled(userId, method, meta = {}) {
  return publish(AUTH_EVENTS.TWO_FACTOR_ENABLED, {
    userId,
    method,
    enabledAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitTwoFactorDisabled(userId, meta = {}) {
  return publish(AUTH_EVENTS.TWO_FACTOR_DISABLED, {
    userId,
    disabledAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitTwoFactorChallenge(userId, sessionId, meta = {}) {
  return publish(AUTH_EVENTS.TWO_FACTOR_CHALLENGE, {
    userId,
    sessionId,
    challengedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitTwoFactorVerified(userId, sessionId, meta = {}) {
  return publish(AUTH_EVENTS.TWO_FACTOR_VERIFIED, {
    userId,
    sessionId,
    verifiedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSessionRevoked(userId, sessionId, reason, meta = {}) {
  return publish(AUTH_EVENTS.SESSION_REVOKED, {
    userId,
    sessionId,
    reason,
    revokedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitDeviceAdded(userId, deviceId, meta = {}) {
  return publish(AUTH_EVENTS.DEVICE_ADDED, {
    userId,
    deviceId,
    addedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitDeviceRemoved(userId, deviceId, meta = {}) {
  return publish(AUTH_EVENTS.DEVICE_REMOVED, {
    userId,
    deviceId,
    removedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSuspiciousActivity(userId, activity, meta = {}) {
  return publish(AUTH_EVENTS.SUSPICIOUS_ACTIVITY, {
    userId,
    activity,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export { AUTH_EVENTS };