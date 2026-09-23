/**
 * Signal Source Event Helpers
 *
 * @module signalforge/server/modules/signal-sources/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { SOURCE_EVENTS } from './source.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'signal-sources',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitSourceCreated(userId, sourceId, sourceType, meta = {}) {
  return publish(SOURCE_EVENTS.SOURCE_CREATED, {
    userId,
    sourceId,
    sourceType,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSourceUpdated(userId, sourceId, changes, meta = {}) {
  return publish(SOURCE_EVENTS.SOURCE_UPDATED, {
    userId,
    sourceId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSourceDeleted(userId, sourceId, meta = {}) {
  return publish(SOURCE_EVENTS.SOURCE_DELETED, {
    userId,
    sourceId,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSourceConnected(userId, sourceId, sourceType, meta = {}) {
  return publish(SOURCE_EVENTS.SOURCE_CONNECTED, {
    userId,
    sourceId,
    sourceType,
    connectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSourceDisconnected(userId, sourceId, reason, meta = {}) {
  return publish(SOURCE_EVENTS.SOURCE_DISCONNECTED, {
    userId,
    sourceId,
    reason,
    disconnectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSourceError(userId, sourceId, error, meta = {}) {
  return publish(SOURCE_EVENTS.SOURCE_ERROR, {
    userId,
    sourceId,
    error: typeof error === 'string' ? error : error.message,
    occurredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSourceSuspended(userId, sourceId, reason, meta = {}) {
  return publish(SOURCE_EVENTS.SOURCE_SUSPENDED, {
    userId,
    sourceId,
    reason,
    suspendedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitMessageReceived(userId, sourceId, messageId, meta = {}) {
  return publish(SOURCE_EVENTS.MESSAGE_RECEIVED, {
    userId,
    sourceId,
    messageId,
    receivedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitMessageEdited(userId, sourceId, messageId, meta = {}) {
  return publish(SOURCE_EVENTS.MESSAGE_EDITED, {
    userId,
    sourceId,
    messageId,
    editedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitMessageDeleted(userId, sourceId, messageId, meta = {}) {
  return publish(SOURCE_EVENTS.MESSAGE_DELETED, {
    userId,
    sourceId,
    messageId,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitMessageProcessed(userId, sourceId, messageId, status, meta = {}) {
  return publish(SOURCE_EVENTS.MESSAGE_PROCESSED, {
    userId,
    sourceId,
    messageId,
    status,
    processedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitMessageError(userId, sourceId, messageId, error, meta = {}) {
  return publish(SOURCE_EVENTS.MESSAGE_ERROR, {
    userId,
    sourceId,
    messageId,
    error: typeof error === 'string' ? error : error.message,
    occurredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitChannelOptedIn(userId, sourceId, channelId, meta = {}) {
  return publish(SOURCE_EVENTS.CHANNEL_OPTED_IN, {
    userId,
    sourceId,
    channelId,
    optedInAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitChannelOptedOut(userId, sourceId, channelId, meta = {}) {
  return publish(SOURCE_EVENTS.CHANNEL_OPTED_OUT, {
    userId,
    sourceId,
    channelId,
    optedOutAt: new Date().toISOString(),
    ...meta,
  });
}

export { SOURCE_EVENTS };