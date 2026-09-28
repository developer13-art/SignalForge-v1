/**
 * Signal Source Event Helpers
 *
 * @module signalforge/server/modules/signal-sources/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { SOURCE_EVENTS } = require('./source.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'signal-sources',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitSourceCreated(userId, sourceId, sourceType, meta = {}) {
  return publish(SOURCE_EVENTS.SOURCE_CREATED, {
    userId,
    sourceId,
    sourceType,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSourceUpdated(userId, sourceId, changes, meta = {}) {
  return publish(SOURCE_EVENTS.SOURCE_UPDATED, {
    userId,
    sourceId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSourceDeleted(userId, sourceId, meta = {}) {
  return publish(SOURCE_EVENTS.SOURCE_DELETED, {
    userId,
    sourceId,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSourceConnected(userId, sourceId, sourceType, meta = {}) {
  return publish(SOURCE_EVENTS.SOURCE_CONNECTED, {
    userId,
    sourceId,
    sourceType,
    connectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSourceDisconnected(userId, sourceId, reason, meta = {}) {
  return publish(SOURCE_EVENTS.SOURCE_DISCONNECTED, {
    userId,
    sourceId,
    reason,
    disconnectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSourceError(userId, sourceId, error, meta = {}) {
  return publish(SOURCE_EVENTS.SOURCE_ERROR, {
    userId,
    sourceId,
    error: typeof error === 'string' ? error : error.message,
    occurredAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSourceSuspended(userId, sourceId, reason, meta = {}) {
  return publish(SOURCE_EVENTS.SOURCE_SUSPENDED, {
    userId,
    sourceId,
    reason,
    suspendedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitMessageReceived(userId, sourceId, messageId, meta = {}) {
  return publish(SOURCE_EVENTS.MESSAGE_RECEIVED, {
    userId,
    sourceId,
    messageId,
    receivedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitMessageEdited(userId, sourceId, messageId, meta = {}) {
  return publish(SOURCE_EVENTS.MESSAGE_EDITED, {
    userId,
    sourceId,
    messageId,
    editedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitMessageDeleted(userId, sourceId, messageId, meta = {}) {
  return publish(SOURCE_EVENTS.MESSAGE_DELETED, {
    userId,
    sourceId,
    messageId,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitMessageProcessed(userId, sourceId, messageId, status, meta = {}) {
  return publish(SOURCE_EVENTS.MESSAGE_PROCESSED, {
    userId,
    sourceId,
    messageId,
    status,
    processedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitMessageError(userId, sourceId, messageId, error, meta = {}) {
  return publish(SOURCE_EVENTS.MESSAGE_ERROR, {
    userId,
    sourceId,
    messageId,
    error: typeof error === 'string' ? error : error.message,
    occurredAt: new Date().toISOString(),
    ...meta,
  });
}
function emitChannelOptedIn(userId, sourceId, channelId, meta = {}) {
  return publish(SOURCE_EVENTS.CHANNEL_OPTED_IN, {
    userId,
    sourceId,
    channelId,
    optedInAt: new Date().toISOString(),
    ...meta,
  });
}
function emitChannelOptedOut(userId, sourceId, channelId, meta = {}) {
  return publish(SOURCE_EVENTS.CHANNEL_OPTED_OUT, {
    userId,
    sourceId,
    channelId,
    optedOutAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitSourceCreated = emitSourceCreated;
module.exports.emitSourceUpdated = emitSourceUpdated;
module.exports.emitSourceDeleted = emitSourceDeleted;
module.exports.emitSourceConnected = emitSourceConnected;
module.exports.emitSourceDisconnected = emitSourceDisconnected;
module.exports.emitSourceError = emitSourceError;
module.exports.emitSourceSuspended = emitSourceSuspended;
module.exports.emitMessageReceived = emitMessageReceived;
module.exports.emitMessageEdited = emitMessageEdited;
module.exports.emitMessageDeleted = emitMessageDeleted;
module.exports.emitMessageProcessed = emitMessageProcessed;
module.exports.emitMessageError = emitMessageError;
module.exports.emitChannelOptedIn = emitChannelOptedIn;
module.exports.emitChannelOptedOut = emitChannelOptedOut;
