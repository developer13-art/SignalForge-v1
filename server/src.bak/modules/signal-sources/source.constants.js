/**
 * Signal Sources Constants
 *
 * @module signalforge/server/modules/signal-sources/constants
 */

export const SOURCE_TYPES = Object.freeze({
  TELEGRAM: 'TELEGRAM',
  DISCORD: 'DISCORD',
  WHATSAPP: 'WHATSAPP',
  TRADINGVIEW: 'TRADINGVIEW',
  EMAIL: 'EMAIL',
  REST_API: 'REST_API',
});

export const SOURCE_CONNECTION_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  ERROR: 'ERROR',
  SUSPENDED: 'SUSPENDED',
  EXPIRED: 'EXPIRED',
});

export const MESSAGE_PROCESSING_STATUSES = Object.freeze({
  RECEIVED: 'RECEIVED',
  QUEUED: 'QUEUED',
  PROCESSING: 'PROCESSING',
  CLASSIFIED: 'CLASSIFIED',
  PARSED: 'PARSED',
  VALIDATED: 'VALIDATED',
  EXECUTED: 'EXECUTED',
  REJECTED: 'REJECTED',
  DUPLICATE: 'DUPLICATE',
  ERROR: 'ERROR',
  ARCHIVED: 'ARCHIVED',
});

export const SOURCE_EVENTS = Object.freeze({
  SOURCE_CREATED: 'source.created',
  SOURCE_UPDATED: 'source.updated',
  SOURCE_DELETED: 'source.deleted',
  SOURCE_CONNECTED: 'source.connected',
  SOURCE_DISCONNECTED: 'source.disconnected',
  SOURCE_ERROR: 'source.error',
  SOURCE_SUSPENDED: 'source.suspended',
  MESSAGE_RECEIVED: 'source.message.received',
  MESSAGE_EDITED: 'source.message.edited',
  MESSAGE_DELETED: 'source.message.deleted',
  MESSAGE_PROCESSED: 'source.message.processed',
  MESSAGE_ERROR: 'source.message.error',
  CHANNEL_OPTED_IN: 'source.channel.opted_in',
  CHANNEL_OPTED_OUT: 'source.channel.opted_out',
});

export const MESSAGE_SOURCES = Object.freeze({
  CHANNEL: 'CHANNEL',
  GROUP: 'GROUP',
  DIRECT: 'DIRECT',
  WEBHOOK: 'WEBHOOK',
  EMAIL_INBOX: 'EMAIL_INBOX',
  API: 'API',
});

export const DEFAULT_MESSAGE_BUFFER_SIZE = 1000;
export const DEFAULT_LISTENER_BATCH_SIZE = 50;
export const DEFAULT_CONCURRENT_HANDLERS = 10;

export const MAX_MESSAGE_TEXT_LENGTH = 10000;
export const MAX_MEDIA_SIZE_BYTES = 25 * 1024 * 1024;

export const CHANNEL_OPT_IN_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  OPTED_IN: 'OPTED_IN',
  OPTED_OUT: 'OPTED_OUT',
});