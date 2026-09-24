/**
 * Telegram Media Handler Service
 *
 * Handles Telegram messages that contain media attachments. Downloads
 * media to private object storage, generates stable storage keys, and
 * returns a normalized media descriptor that downstream services can
 * reference. Media is never served from a public URL.
 *
 * @module server/modules/signal-sources/telegram/listener/telegram-media-handler.service
 */

import crypto from 'node:crypto';
import { AppError } from '../../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../../lib/errors/error-codes';
import { logger } from '../../../../lib/logger';
import { getTelegramClient } from '../client/telegram-client.factory';
import { storageService } from '../../../../lib/storage';

const MAX_MEDIA_BYTES = 25 * 1024 * 1024;

const ALLOWED_MEDIA_TYPES = Object.freeze([
  'photo',
  'video',
  'document',
  'audio',
  'voice',
  'animation',
  'sticker',
]);

function buildStorageKey({ userId, channelId, messageId, mediaType, extension }) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(6).toString('hex');
  const safeExtension = extension ? extension.replace(/^\./, '') : 'bin';
  return `telegram/${userId}/${channelId}/${messageId}/${mediaType}-${timestamp}-${random}.${safeExtension}`;
}

function inferExtension(mimeType, fallbackFileName) {
  if (fallbackFileName && fallbackFileName.includes('.')) {
    return fallbackFileName.split('.').pop().toLowerCase();
  }

  if (!mimeType) {
    return 'bin';
  }

  const map = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'audio/mpeg': 'mp3',
    'audio/ogg': 'ogg',
    'audio/wav': 'wav',
    'application/pdf': 'pdf',
  };

  return map[mimeType] || 'bin';
}

export async function handleMediaMessage({ userId, message }) {
  if (!userId || !message) {
    throw new AppError('userId and message are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!message.media) {
    return { handled: false, reason: 'NO_MEDIA' };
  }

  const client = getTelegramClient({ userId });
  const mediaItems = Array.isArray(message.media) ? message.media : [message.media];
  const processed = [];

  for (const media of mediaItems) {
    if (!media || !media.type) {
      continue;
    }

    if (!ALLOWED_MEDIA_TYPES.includes(media.type)) {
      logger.debug({ userId, mediaType: media.type }, 'Skipping unsupported Telegram media type');
      processed.push({
        type: media.type,
        skipped: true,
        reason: 'UNSUPPORTED_TYPE',
      });
      continue;
    }

    if (typeof media.fileSize === 'number' && media.fileSize > MAX_MEDIA_BYTES) {
      logger.warn({ userId, fileSize: media.fileSize }, 'Skipping oversized Telegram media');
      processed.push({
        type: media.type,
        skipped: true,
        reason: 'TOO_LARGE',
      });
      continue;
    }

    let downloaded;
    try {
      downloaded = await client.downloadMedia({
        channelId: message.channelId,
        messageId: message.messageId,
        mediaType: media.type,
      });
    } catch (err) {
      logger.error({ err, userId, mediaType: media.type }, 'Failed to download Telegram media');
      processed.push({
        type: media.type,
        skipped: true,
        reason: 'DOWNLOAD_FAILED',
      });
      continue;
    }

    if (!downloaded || !downloaded.buffer) {
      processed.push({
        type: media.type,
        skipped: true,
        reason: 'EMPTY_DOWNLOAD',
      });
      continue;
    }

    const extension = inferExtension(media.mimeType, downloaded.fileName);
    const storageKey = buildStorageKey({
      userId,
      channelId: message.channelId,
      messageId: message.messageId,
      mediaType: media.type,
      extension,
    });

    try {
      await storageService.uploadPrivate({
        key: storageKey,
        body: downloaded.buffer,
        contentType: media.mimeType || 'application/octet-stream',
      });
    } catch (err) {
      logger.error({ err, userId, storageKey }, 'Failed to store Telegram media');
      processed.push({
        type: media.type,
        skipped: true,
        reason: 'STORAGE_FAILED',
      });
      continue;
    }

    processed.push({
      type: media.type,
      mimeType: media.mimeType || null,
      fileSize: media.fileSize || downloaded.buffer.length,
      durationSeconds: media.durationSeconds || null,
      width: media.width || null,
      height: media.height || null,
      fileName: downloaded.fileName || null,
      caption: media.caption || null,
      storageKey,
      skipped: false,
    });
  }

  logger.info(
    { userId, channelId: message.channelId, messageId: message.messageId, count: processed.length },
    'Telegram media processed',
  );

  return { handled: true, media: processed };
}

export const telegramMediaHandlerService = {
  handleMediaMessage,
  ALLOWED_MEDIA_TYPES,
  MAX_MEDIA_BYTES,
};