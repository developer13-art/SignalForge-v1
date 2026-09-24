/**
 * Telegram Delete Handler Service
 *
 * Handles Telegram messages that have been deleted after they were
 * first delivered. A delete never erases history; it emits a
 * SIGNAL_DELETED event so the audit trail always explains why a trade
 * was changed.
 *
 * @module server/modules/signal-sources/telegram/listener/telegram-delete-handler.service
 */

import { AppError } from '../../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../../lib/errors/error-codes';
import { logger } from '../../../../lib/logger';
import { SOURCE_TYPES } from '@signalforge/shared/constants/source-types';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { buildSourceMessageKey } from '@signalforge/shared/utils/idempotency.util';
import { publishEvent } from '../../../../events/event-publisher';
import { messageRawStoreService } from '../messages/message-raw-store.service';

export async function handleMessageDeleted({ userId, message, onDelete }) {
  if (!userId || !message) {
    throw new AppError('userId and message are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!message.channelId || !message.messageId) {
    throw new AppError('Telegram message is missing channelId or messageId', ERROR_CODES.TELEGRAM_MESSAGE_INVALID, 400);
  }

  const deletedAt = message.deletedAt
    ? (message.deletedAt instanceof Date ? message.deletedAt.toISOString() : String(message.deletedAt))
    : new Date().toISOString();

  const idempotencyKey = buildSourceMessageKey(
    SOURCE_TYPES.TELEGRAM,
    String(message.channelId),
    String(message.messageId),
  );

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
    isDeleted: true,
    deletedAt,
    timestamp: deletedAt,
    idempotencyKey: `${idempotencyKey}:delete:${deletedAt}`,
    rawPayload: message.rawPayload || null,
  };

  const stored = await messageRawStoreService.persistDelete({
    userId,
    envelope,
  });

  if (stored && stored.duplicate) {
    logger.debug({ userId, idempotencyKey }, 'Duplicate Telegram delete skipped');
    return { handled: false, duplicate: true, messageId: envelope.externalMessageId };
  }

  if (typeof onDelete === 'function') {
    await onDelete({
      userId,
      envelope,
      storedMessageId: stored ? stored.id : null,
    });
    return { handled: true, forwardedTo: 'custom', messageId: envelope.externalMessageId };
  }

  await publishEvent({
    eventType: EVENT_TYPES.SIGNAL_DELETED,
    source: 'telegram.delete-handler',
    actorId: userId,
    payload: {
      ...envelope,
      storedMessageId: stored ? stored.id : null,
    },
  });

  logger.info(
    { userId, channelId: envelope.channelId, messageId: envelope.externalMessageId, deletedAt },
    'Telegram message delete ingested',
  );

  return { handled: true, storedMessageId: stored ? stored.id : null, messageId: envelope.externalMessageId };
}

export const telegramDeleteHandlerService = {
  handleMessageDeleted,
};