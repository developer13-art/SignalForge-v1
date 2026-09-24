/**
 * Discord Message Handler Service
 *
 * Normalizes Discord messages received via the gateway or a webhook
 * into the canonical signal source envelope and publishes the
 * MESSAGE_RECEIVED event on the platform event bus.
 *
 * @module server/modules/signal-sources/discord/discord-message-handler.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { SOURCE_TYPES } from '@signalforge/shared/constants/source-types';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { buildSourceMessageKey } from '@signalforge/shared/utils/idempotency.util';
import { buildMessageFingerprint } from '@signalforge/shared/utils/fingerprint.util';
import { publishEvent } from '../../../events/event-publisher';
import { messageRawStoreService } from '../messages/message-raw-store.service';

function normalizeAttachments(attachments) {
  if (!Array.isArray(attachments) || attachments.length === 0) {
    return null;
  }

  return attachments.map((attachment) => ({
    id: attachment.id || null,
    fileName: attachment.filename || null,
    contentType: attachment.content_type || null,
    sizeBytes: attachment.size || null,
    url: attachment.url || null,
    proxyUrl: attachment.proxy_url || null,
    width: attachment.width || null,
    height: attachment.height || null,
  }));
}

function normalizeEmbeds(embeds) {
  if (!Array.isArray(embeds) || embeds.length === 0) {
    return null;
  }

  return embeds.map((embed) => ({
    title: embed.title || null,
    description: embed.description || null,
    url: embed.url || null,
    color: embed.color || null,
    timestamp: embed.timestamp || null,
    author: embed.author
      ? {
          name: embed.author.name || null,
          url: embed.author.url || null,
        }
      : null,
    fields: Array.isArray(embed.fields)
      ? embed.fields.map((field) => ({
          name: field.name || null,
          value: field.value || null,
          inline: Boolean(field.inline),
        }))
      : null,
    image: embed.image ? { url: embed.image.url || null } : null,
    thumbnail: embed.thumbnail ? { url: embed.thumbnail.url || null } : null,
  }));
}

export async function handleDiscordMessage({ userId, message }) {
  if (!userId || !message) {
    throw new AppError('userId and message are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!message.channelId || !message.messageId) {
    throw new AppError('Discord message is missing channelId or messageId', ERROR_CODES.DISCORD_MESSAGE_INVALID, 400);
  }

  const timestamp = message.timestamp
    ? (message.timestamp instanceof Date ? message.timestamp.toISOString() : String(message.timestamp))
    : new Date().toISOString();

  const idempotencyKey = buildSourceMessageKey(
    SOURCE_TYPES.DISCORD,
    String(message.channelId),
    String(message.messageId),
  );

  const fingerprint = buildMessageFingerprint({
    sourceType: SOURCE_TYPES.DISCORD,
    sourceId: String(message.channelId),
    externalMessageId: String(message.messageId),
    timestamp,
  });

  const envelope = {
    sourceType: SOURCE_TYPES.DISCORD,
    sourceId: String(message.channelId),
    guildId: message.guildId ? String(message.guildId) : null,
    channelId: String(message.channelId),
    channelName: message.channelName || null,
    externalMessageId: String(message.messageId),
    userId,
    senderId: message.authorId || null,
    senderName: message.authorName || null,
    senderIsBot: Boolean(message.authorIsBot),
    text: message.content || '',
    attachments: normalizeAttachments(message.attachments),
    embeds: normalizeEmbeds(message.embeds),
    replyTo: message.referencedMessageId || null,
    isEdited: Boolean(message.editedTimestamp),
    timestamp,
    idempotencyKey,
    fingerprint,
    rawPayload: message.rawPayload || null,
  };

  const stored = await messageRawStoreService.persistIncoming({ userId, envelope });

  if (stored && stored.duplicate) {
    logger.debug({ userId, idempotencyKey }, 'Duplicate Discord message skipped');
    return { handled: false, duplicate: true, messageId: envelope.externalMessageId };
  }

  await publishEvent({
    eventType: EVENT_TYPES.MESSAGE_RECEIVED,
    source: 'discord.message-handler',
    actorId: userId,
    payload: {
      ...envelope,
      storedMessageId: stored ? stored.id : null,
    },
  });

  logger.info(
    { userId, guildId: envelope.guildId, channelId: envelope.channelId, messageId: envelope.externalMessageId },
    'Discord message ingested',
  );

  return { handled: true, storedMessageId: stored ? stored.id : null, messageId: envelope.externalMessageId };
}

export async function handleDiscordEditedMessage({ userId, message }) {
  if (!userId || !message) {
    throw new AppError('userId and message are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const editedAt = message.editedTimestamp
    ? (message.editedTimestamp instanceof Date ? message.editedTimestamp.toISOString() : String(message.editedTimestamp))
    : new Date().toISOString();

  const idempotencyKey = `${buildSourceMessageKey(SOURCE_TYPES.DISCORD, String(message.channelId), String(message.messageId))}:edit:${editedAt}`;

  const envelope = {
    sourceType: SOURCE_TYPES.DISCORD,
    sourceId: String(message.channelId),
    guildId: message.guildId ? String(message.guildId) : null,
    channelId: String(message.channelId),
    externalMessageId: String(message.messageId),
    userId,
    senderId: message.authorId || null,
    text: message.content || '',
    isEdited: true,
    editedAt,
    timestamp: editedAt,
    idempotencyKey,
    fingerprint: buildMessageFingerprint({
      sourceType: SOURCE_TYPES.DISCORD,
      sourceId: String(message.channelId),
      externalMessageId: String(message.messageId),
      timestamp: editedAt,
    }),
  };

  const stored = await messageRawStoreService.persistEdit({ userId, envelope });

  await publishEvent({
    eventType: EVENT_TYPES.SIGNAL_UPDATED,
    source: 'discord.message-handler',
    actorId: userId,
    payload: { ...envelope, storedMessageId: stored ? stored.id : null },
  });

  return { handled: true, storedMessageId: stored ? stored.id : null, messageId: envelope.externalMessageId };
}

export async function handleDiscordDeletedMessage({ userId, message }) {
  if (!userId || !message) {
    throw new AppError('userId and message are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const deletedAt = new Date().toISOString();

  const idempotencyKey = `${buildSourceMessageKey(SOURCE_TYPES.DISCORD, String(message.channelId), String(message.messageId))}:delete:${deletedAt}`;

  const envelope = {
    sourceType: SOURCE_TYPES.DISCORD,
    sourceId: String(message.channelId),
    guildId: message.guildId ? String(message.guildId) : null,
    channelId: String(message.channelId),
    externalMessageId: String(message.messageId),
    userId,
    isDeleted: true,
    deletedAt,
    timestamp: deletedAt,
    idempotencyKey,
  };

  const stored = await messageRawStoreService.persistDelete({ userId, envelope });

  await publishEvent({
    eventType: EVENT_TYPES.SIGNAL_DELETED,
    source: 'discord.message-handler',
    actorId: userId,
    payload: { ...envelope, storedMessageId: stored ? stored.id : null },
  });

  return { handled: true, storedMessageId: stored ? stored.id : null, messageId: envelope.externalMessageId };
}

export const discordMessageHandlerService = {
  handleDiscordMessage,
  handleDiscordEditedMessage,
  handleDiscordDeletedMessage,
};