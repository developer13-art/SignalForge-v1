/**
 * Telegram Events
 *
 * Defines the Telegram-specific event names and helpers for publishing
 * and subscribing to Telegram integration events on the platform Event
 * Bus. Events are named consistently with the platform Event Types.
 *
 * @module server/modules/signal-sources/telegram/telegram.events
 */

import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { SOURCE_TYPES } from '@signalforge/shared/constants/source-types';
import { publishEvent } from '../../../events/event-publisher';

const SOURCE = 'telegram.events';

export async function emitTelegramSessionInitiated({ userId, sessionId, phoneNumber }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_SESSION_INITIATED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TELEGRAM,
      userId,
      sessionId,
      phoneNumber,
      initiatedAt: new Date().toISOString(),
    },
  });
}

export async function emitTelegramSessionConnected({ userId, sessionId, telegramUserId }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_SESSION_CONNECTED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TELEGRAM,
      userId,
      sessionId,
      telegramUserId,
      connectedAt: new Date().toISOString(),
    },
  });
}

export async function emitTelegramSessionRevoked({ userId, sessionId, reason }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_SESSION_REVOKED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TELEGRAM,
      userId,
      sessionId,
      reason: reason || null,
      revokedAt: new Date().toISOString(),
    },
  });
}

export async function emitTelegramSessionExpired({ userId, sessionId }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_SESSION_EXPIRED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TELEGRAM,
      userId,
      sessionId,
      expiredAt: new Date().toISOString(),
    },
  });
}

export async function emitTelegramChannelsDiscovered({ userId, sessionId, channelCount }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_CHANNELS_DISCOVERED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TELEGRAM,
      userId,
      sessionId,
      channelCount,
      discoveredAt: new Date().toISOString(),
    },
  });
}

export async function emitTelegramChannelOptIn({ userId, channelId, channelTitle }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_CHANNEL_OPT_IN,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TELEGRAM,
      userId,
      channelId,
      channelTitle: channelTitle || null,
      optedInAt: new Date().toISOString(),
    },
  });
}

export async function emitTelegramChannelOptOut({ userId, channelId }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_CHANNEL_OPT_OUT,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TELEGRAM,
      userId,
      channelId,
      optedOutAt: new Date().toISOString(),
    },
  });
}

export async function emitTelegramListenerStarted({ userId, channelCount }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_LISTENER_STARTED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TELEGRAM,
      userId,
      channelCount,
      startedAt: new Date().toISOString(),
    },
  });
}

export async function emitTelegramListenerStopped({ userId, reason }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_LISTENER_STOPPED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TELEGRAM,
      userId,
      reason: reason || null,
      stoppedAt: new Date().toISOString(),
    },
  });
}

export async function emitTelegramReconnectAttempt({ userId, attempt, delayMs }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_RECONNECT_ATTEMPT,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TELEGRAM,
      userId,
      attempt,
      delayMs,
      attemptedAt: new Date().toISOString(),
    },
  });
}

export async function emitTelegramReconnectSucceeded({ userId, attempt }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_RECONNECT_SUCCEEDED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TELEGRAM,
      userId,
      attempt,
      succeededAt: new Date().toISOString(),
    },
  });
}

export async function emitTelegramReconnectFailed({ userId, attempts, error }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_RECONNECT_FAILED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TELEGRAM,
      userId,
      attempts,
      error: error ? String(error.message || error) : null,
      failedAt: new Date().toISOString(),
    },
  });
}

export async function emitTelegramRateLimitHit({ userId, operation, retryAfterMs }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_RATE_LIMIT_HIT,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TELEGRAM,
      userId,
      operation,
      retryAfterMs,
      hitAt: new Date().toISOString(),
    },
  });
}

export async function emitTelegramHealthCheck({ userId, healthy, details }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_HEALTH_CHECK,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TELEGRAM,
      userId,
      healthy,
      details: details || null,
      checkedAt: new Date().toISOString(),
    },
  });
}

export const TELEGRAM_EVENT_NAMES = Object.freeze({
  SESSION_INITIATED: EVENT_TYPES.SOURCE_SESSION_INITIATED,
  SESSION_CONNECTED: EVENT_TYPES.SOURCE_SESSION_CONNECTED,
  SESSION_REVOKED: EVENT_TYPES.SOURCE_SESSION_REVOKED,
  SESSION_EXPIRED: EVENT_TYPES.SOURCE_SESSION_EXPIRED,
  CHANNELS_DISCOVERED: EVENT_TYPES.SOURCE_CHANNELS_DISCOVERED,
  CHANNEL_OPT_IN: EVENT_TYPES.SOURCE_CHANNEL_OPT_IN,
  CHANNEL_OPT_OUT: EVENT_TYPES.SOURCE_CHANNEL_OPT_OUT,
  LISTENER_STARTED: EVENT_TYPES.SOURCE_LISTENER_STARTED,
  LISTENER_STOPPED: EVENT_TYPES.SOURCE_LISTENER_STOPPED,
  RECONNECT_ATTEMPT: EVENT_TYPES.SOURCE_RECONNECT_ATTEMPT,
  RECONNECT_SUCCEEDED: EVENT_TYPES.SOURCE_RECONNECT_SUCCEEDED,
  RECONNECT_FAILED: EVENT_TYPES.SOURCE_RECONNECT_FAILED,
  RATE_LIMIT_HIT: EVENT_TYPES.SOURCE_RATE_LIMIT_HIT,
  HEALTH_CHECK: EVENT_TYPES.SOURCE_HEALTH_CHECK,
});