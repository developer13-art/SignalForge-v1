/**
 * Email Events
 *
 * Defines email-specific event names and helpers for publishing email
 * integration events on the platform Event Bus.
 *
 * @module server/modules/signal-sources/email/email.events
 */

import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { SOURCE_TYPES } from '@signalforge/shared/constants/source-types';
import { publishEvent } from '../../../events/event-publisher';

const SOURCE = 'email.events';

export async function emitEmailSessionInitiated({ userId, mailbox }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_SESSION_INITIATED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.EMAIL,
      userId,
      mailbox,
      initiatedAt: new Date().toISOString(),
    },
  });
}

export async function emitEmailSessionConnected({ userId, mailbox }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_SESSION_CONNECTED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.EMAIL,
      userId,
      mailbox,
      connectedAt: new Date().toISOString(),
    },
  });
}

export async function emitEmailSessionRevoked({ userId, reason }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_SESSION_REVOKED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.EMAIL,
      userId,
      reason: reason || null,
      revokedAt: new Date().toISOString(),
    },
  });
}

export async function emitEmailMessageReceived({ userId, messageId, from, subject }) {
  return publishEvent({
    eventType: EVENT_TYPES.MESSAGE_RECEIVED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.EMAIL,
      userId,
      externalMessageId: messageId,
      from: from || null,
      subject: subject || null,
      receivedAt: new Date().toISOString(),
    },
  });
}

export async function emitEmailMessageRejected({ userId, messageId, reason }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_WEBHOOK_REJECTED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.EMAIL,
      userId,
      externalMessageId: messageId,
      reason: reason || null,
      rejectedAt: new Date().toISOString(),
    },
  });
}

export async function emitEmailHealthCheck({ userId, healthy, details }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_HEALTH_CHECK,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.EMAIL,
      userId,
      healthy,
      details: details || null,
      checkedAt: new Date().toISOString(),
    },
  });
}

export const EMAIL_EVENT_NAMES = Object.freeze({
  SESSION_INITIATED: EVENT_TYPES.SOURCE_SESSION_INITIATED,
  SESSION_CONNECTED: EVENT_TYPES.SOURCE_SESSION_CONNECTED,
  SESSION_REVOKED: EVENT_TYPES.SOURCE_SESSION_REVOKED,
  MESSAGE_RECEIVED: EVENT_TYPES.MESSAGE_RECEIVED,
  MESSAGE_REJECTED: EVENT_TYPES.SOURCE_WEBHOOK_REJECTED,
  HEALTH_CHECK: EVENT_TYPES.SOURCE_HEALTH_CHECK,
});