/**
 * WhatsApp Events
 *
 * Defines WhatsApp-specific event names and helpers for publishing
 * WhatsApp integration events on the platform Event Bus.
 *
 * @module server/modules/signal-sources/whatsapp/whatsapp.events
 */

import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { SOURCE_TYPES } from '@signalforge/shared/constants/source-types';
import { publishEvent } from '../../../events/event-publisher';

const SOURCE = 'whatsapp.events';

export async function emitWhatsAppSessionInitiated({ userId, phoneNumberId }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_SESSION_INITIATED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.WHATSAPP,
      userId,
      phoneNumberId,
      initiatedAt: new Date().toISOString(),
    },
  });
}

export async function emitWhatsAppSessionConnected({ userId, phoneNumberId, businessAccountId }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_SESSION_CONNECTED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.WHATSAPP,
      userId,
      phoneNumberId,
      businessAccountId,
      connectedAt: new Date().toISOString(),
    },
  });
}

export async function emitWhatsAppSessionRevoked({ userId, reason }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_SESSION_REVOKED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.WHATSAPP,
      userId,
      reason: reason || null,
      revokedAt: new Date().toISOString(),
    },
  });
}

export async function emitWhatsAppGroupsDiscovered({ userId, groupCount }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_CHANNELS_DISCOVERED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.WHATSAPP,
      userId,
      groupCount,
      discoveredAt: new Date().toISOString(),
    },
  });
}

export async function emitWhatsAppGroupOptIn({ userId, groupId, groupName }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_CHANNEL_OPT_IN,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.WHATSAPP,
      userId,
      groupId,
      groupName: groupName || null,
      optedInAt: new Date().toISOString(),
    },
  });
}

export async function emitWhatsAppGroupOptOut({ userId, groupId }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_CHANNEL_OPT_OUT,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.WHATSAPP,
      userId,
      groupId,
      optedOutAt: new Date().toISOString(),
    },
  });
}

export async function emitWhatsAppWebhookReceived({ userId, messageId, groupId }) {
  return publishEvent({
    eventType: EVENT_TYPES.MESSAGE_RECEIVED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.WHATSAPP,
      userId,
      externalMessageId: messageId,
      groupId,
      receivedAt: new Date().toISOString(),
    },
  });
}

export async function emitWhatsAppWebhookRejected({ userId, reason }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_WEBHOOK_REJECTED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.WHATSAPP,
      userId,
      reason: reason || null,
      rejectedAt: new Date().toISOString(),
    },
  });
}

export async function emitWhatsAppHealthCheck({ userId, healthy, details }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_HEALTH_CHECK,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.WHATSAPP,
      userId,
      healthy,
      details: details || null,
      checkedAt: new Date().toISOString(),
    },
  });
}

export const WHATSAPP_EVENT_NAMES = Object.freeze({
  SESSION_INITIATED: EVENT_TYPES.SOURCE_SESSION_INITIATED,
  SESSION_CONNECTED: EVENT_TYPES.SOURCE_SESSION_CONNECTED,
  SESSION_REVOKED: EVENT_TYPES.SOURCE_SESSION_REVOKED,
  GROUPS_DISCOVERED: EVENT_TYPES.SOURCE_CHANNELS_DISCOVERED,
  GROUP_OPT_IN: EVENT_TYPES.SOURCE_CHANNEL_OPT_IN,
  GROUP_OPT_OUT: EVENT_TYPES.SOURCE_CHANNEL_OPT_OUT,
  WEBHOOK_RECEIVED: EVENT_TYPES.MESSAGE_RECEIVED,
  WEBHOOK_REJECTED: EVENT_TYPES.SOURCE_WEBHOOK_REJECTED,
  HEALTH_CHECK: EVENT_TYPES.SOURCE_HEALTH_CHECK,
});