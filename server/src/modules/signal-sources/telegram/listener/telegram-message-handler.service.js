/**
 * Telegram Message Handler Service
 *
 * Normalizes a raw Telegram message into the platform's canonical
 * message envelope, persists the raw message, generates an idempotency
 * key and fingerprint, and publishes the MESSAGE_RECEIVED event.
 *
 * @module server/modules/signal-sources/telegram/listener/telegram-message-handler.service
 */
const { AppError } = require('../../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../../lib/errors/error-codes');
const { logger } = require('../../../../lib/logger');
const { SOURCE_TYPES } = require('@signalforge/shared/constants/source-types');
const { EVENT_TYPES } = require('@signalforge/shared/constants/event-types');
const { buildSourceMessageKey } = require('@signalforge/shared/utils/idempotency.util');
const { buildMessageFingerprint } = require('@signalforge/shared/utils/fingerprint.util');
const { publishEvent } = require('../../../../events/event-publisher');
const { messageRawStoreService } = require('../../messages/message-raw-store.service');

function normalizeMedia(media) {
  if (!media) {
    return null;
  }

  if (Array.isArray(media)) {
    return media.map((item) => ({
      type: item.type || null,
      mimeType: item.mimeType || null,
      fileSize: item.fileSize || null,
      durationSeconds: item.durationSeconds || null,
      width: item.width || null,
      height: item.height || null,
      fileName: item.fileName || null,
      caption: item.caption || null,
      storageKey: item.storageKey || null,
    }));
  }

  return {
    type: media.type || null,
    mimeType: media.mimeType || null,
    fileSize: media.fileSize || null,
    durationSeconds: media.durationSeconds || null,
    width: media.width || null,
    height: media.height || null,
    fileName: media.fileName || null,
    caption: media.caption || null,
    storageKey: media.storageKey || null,
  };
}
async function handleIncomingMessage({ userId, message, onMessage }) {
  if (!userId || !message) {
    throw new AppError('userId and message are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!message.channelId || !message.messageId) {
    throw new AppError('Telegram message is missing channelId or messageId', ERROR_CODES.TELEGRAM_MESSAGE_INVALID, 400);
  }

  const timestamp = message.timestamp
    ? (message.timestamp instanceof Date ? message.timestamp.toISOString() : String(message.timestamp))
    : new Date().toISOString();

  const idempotencyKey = buildSourceMessageKey(
    SOURCE_TYPES.TELEGRAM,
    String(message.channelId),
    String(message.messageId),
  );

  const fingerprint = buildMessageFingerprint({
    sourceType: SOURCE_TYPES.TELEGRAM,
    sourceId: String(message.channelId),
    externalMessageId: String(message.messageId),
    timestamp,
  });

  const envelope = {
    sourceType: SOURCE_TYPES.TELEGRAM,
    sourceId: String(message.channelId),
    channelId: String(message.channelId),
    channelTitle: message.channelTitle || null,
    externalMessageId: String(message.messageId),
    userId,
    senderId: message.senderId || null,
    senderName: message.senderName || null,
    text: message.text || '',
    media: normalizeMedia(message.media),
    replyTo: message.replyTo || null,
    isForwarded: Boolean(message.isForwarded),
    forwardedFrom: message.forwardedFrom || null,
    isEdited: Boolean(message.isEdited),
    isDeleted: false,
    timestamp,
    idempotencyKey,
    fingerprint,
    rawPayload: message.rawPayload || null,
  };

  const stored = await messageRawStoreService.persistIncoming({
    userId,
    envelope,
  });

  if (stored && stored.duplicate) {
    logger.debug({ userId, idempotencyKey }, 'Duplicate Telegram message skipped');
    return { handled: false, duplicate: true, messageId: envelope.externalMessageId };
  }

  if (typeof onMessage === 'function') {
    await onMessage({
      userId,
      envelope,
      storedMessageId: stored ? stored.id : null,
    });
    return { handled: true, forwardedTo: 'custom', messageId: envelope.externalMessageId };
  }

  await publishEvent({
    eventType: EVENT_TYPES.MESSAGE_RECEIVED,
    source: 'telegram.message-handler',
    actorId: userId,
    payload: {
      ...envelope,
      storedMessageId: stored ? stored.id : null,
    },
  });

  logger.info(
    { userId, channelId: envelope.channelId, messageId: envelope.externalMessageId },
    'Telegram message ingested',
  );

  return { handled: true, storedMessageId: stored ? stored.id : null, messageId: envelope.externalMessageId };
}
function isSignalLike(message) {
  if (!message || typeof message.text !== 'string') {
    return false;
  }
  const text = message.text.trim();
  if (text.length === 0) {
    return false;
  }
  if (text.length > 2000) {
    return false;
  }
  return true;
}
const telegramMessageHandlerService = {
  handleIncomingMessage,
  isSignalLike,
};
module.exports.telegramMessageHandlerService = telegramMessageHandlerService;
module.exports.isSignalLike = isSignalLike;

module.exports.handleIncomingMessage = handleIncomingMessage;
