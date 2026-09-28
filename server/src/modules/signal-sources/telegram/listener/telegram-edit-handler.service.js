/**
 * Telegram Edit Handler Service
 *
 * Handles Telegram messages that have been edited after they were first
 * delivered. An edit never creates a new trade; it emits a
 * SIGNAL_UPDATED event that revises the existing trade instructions.
 *
 * @module server/modules/signal-sources/telegram/listener/telegram-edit-handler.service
 */
const { AppError } = require('../../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../../lib/errors/error-codes');
const { logger } = require('../../../../lib/logger');
const { SOURCE_TYPES } = require('@signalforge/shared/constants/source-types');
const { EVENT_TYPES } = require('@signalforge/shared/constants/event-types');
const { buildSourceMessageKey } = require('@signalforge/shared/utils/idempotency.util');
const { buildMessageFingerprint } = require('@signalforge/shared/utils/fingerprint.util');
const { publishEvent } = require('../../../../events/event-publisher');
const { messageRawStoreService } = require('../messages/message-raw-store.service');
async function handleMessageEdited({ userId, message, onEdit }) {
  if (!userId || !message) {
    throw new AppError('userId and message are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!message.channelId || !message.messageId) {
    throw new AppError('Telegram message is missing channelId or messageId', ERROR_CODES.TELEGRAM_MESSAGE_INVALID, 400);
  }

  const editedAt = message.editedAt
    ? (message.editedAt instanceof Date ? message.editedAt.toISOString() : String(message.editedAt))
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
    timestamp: editedAt,
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
    media: message.media || null,
    replyTo: message.replyTo || null,
    isEdited: true,
    editedAt,
    timestamp: editedAt,
    idempotencyKey: `${idempotencyKey}:edit:${editedAt}`,
    fingerprint,
    originalFingerprint: fingerprint,
    rawPayload: message.rawPayload || null,
  };

  const stored = await messageRawStoreService.persistEdit({
    userId,
    envelope,
  });

  if (stored && stored.duplicate) {
    logger.debug({ userId, idempotencyKey }, 'Duplicate Telegram edit skipped');
    return { handled: false, duplicate: true, messageId: envelope.externalMessageId };
  }

  if (typeof onEdit === 'function') {
    await onEdit({
      userId,
      envelope,
      storedMessageId: stored ? stored.id : null,
    });
    return { handled: true, forwardedTo: 'custom', messageId: envelope.externalMessageId };
  }

  await publishEvent({
    eventType: EVENT_TYPES.SIGNAL_UPDATED,
    source: 'telegram.edit-handler',
    actorId: userId,
    payload: {
      ...envelope,
      storedMessageId: stored ? stored.id : null,
    },
  });

  logger.info(
    { userId, channelId: envelope.channelId, messageId: envelope.externalMessageId, editedAt },
    'Telegram message edit ingested',
  );

  return { handled: true, storedMessageId: stored ? stored.id : null, messageId: envelope.externalMessageId };
}
const telegramEditHandlerService = {
  handleMessageEdited,
};
module.exports.telegramEditHandlerService = telegramEditHandlerService;

module.exports.handleMessageEdited = handleMessageEdited;
