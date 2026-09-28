/**
 * WhatsApp Media Service
 *
 * Handles WhatsApp media messages (image, video, audio, document,
 * sticker). Downloads media from the WhatsApp Cloud API and stores it
 * in private object storage, returning a normalized media descriptor.
 *
 * @module server/modules/signal-sources/whatsapp/whatsapp-media.service
 */

import crypto from 'node:crypto';
import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { storageService } from '../../../lib/storage';
import { whatsappCloudService } from './whatsapp-cloud.service';

const GRAPH_BASE = 'https://graph.facebook.com/v20.0';
const MAX_MEDIA_BYTES = 25 * 1024 * 1024;

const SUPPORTED_MEDIA_TYPES = Object.freeze([
  'image',
  'video',
  'audio',
  'document',
  'sticker',
]);

function buildStorageKey({ userId, phoneNumberId, messageId, mediaType, extension }) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(6).toString('hex');
  const safeExtension = extension ? extension.replace(/^\./, '') : 'bin';
  return `whatsapp/${userId}/${phoneNumberId}/${messageId}/${mediaType}-${timestamp}-${random}.${safeExtension}`;
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
    'video/mp4': 'mp4',
    'video/3gpp': '3gp',
    'audio/aac': 'aac',
    'audio/mp4': 'm4a',
    'audio/mpeg': 'mp3',
    'audio/amr': 'amr',
    'audio/ogg': 'ogg',
    'application/pdf': 'pdf',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  };
  return map[mimeType] || 'bin';
}

function extractMediaInfo(message) {
  if (!message || typeof message !== 'object') {
    return null;
  }

  for (const type of SUPPORTED_MEDIA_TYPES) {
    if (message[type]) {
      return { mediaType: type, info: message[type] };
    }
  }

  return null;
}

export async function handleWhatsAppMediaMessage({ userId, phoneNumberId, message, envelope }) {
  if (!userId || !phoneNumberId || !message) {
    throw new AppError(
      'userId, phoneNumberId, and message are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const media = extractMediaInfo(message);

  if (!media) {
    return { handled: false, reason: 'NO_MEDIA' };
  }

  const connection = await whatsappCloudService.getAccessToken({ userId });

  if (!connection) {
    throw new AppError('WhatsApp connection not found for user', ERROR_CODES.WHATSAPP_CONNECTION_NOT_FOUND, 404);
  }

  const mediaId = media.info.id;

  if (!mediaId) {
    logger.debug({ userId, messageId: message.id }, 'WhatsApp media message has no media id');
    return { handled: false, reason: 'MISSING_MEDIA_ID' };
  }

  let metadata;
  try {
    const response = await fetch(`${GRAPH_BASE}/${mediaId}`, {
      headers: { Authorization: `Bearer ${connection.accessToken}` },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`WhatsApp media metadata failed: ${response.status} ${body}`);
    }

    metadata = await response.json();
  } catch (err) {
    logger.error({ err, userId, mediaId }, 'Failed to fetch WhatsApp media metadata');
    return { handled: false, reason: 'METADATA_FAILED' };
  }

  const fileSize = Number(metadata.file_size) || 0;

  if (fileSize > MAX_MEDIA_BYTES) {
    logger.warn({ userId, mediaId, fileSize }, 'WhatsApp media is too large to download');
    return { handled: false, reason: 'TOO_LARGE', fileSize };
  }

  const downloadUrl = metadata.url;

  if (!downloadUrl) {
    return { handled: false, reason: 'NO_DOWNLOAD_URL' };
  }

  let buffer;
  try {
    const response = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${connection.accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } catch (err) {
    logger.error({ err, userId, mediaId }, 'Failed to download WhatsApp media');
    return { handled: false, reason: 'DOWNLOAD_FAILED' };
  }

  const mimeType = metadata.mime_type || null;
  const fileName = media.info.filename || null;
  const extension = inferExtension(mimeType, fileName);

  const storageKey = buildStorageKey({
    userId,
    phoneNumberId,
    messageId: message.id,
    mediaType: media.mediaType,
    extension,
  });

  try {
    await storageService.uploadPrivate({
      key: storageKey,
      body: buffer,
      contentType: mimeType || 'application/octet-stream',
    });
  } catch (err) {
    logger.error({ err, userId, storageKey }, 'Failed to store WhatsApp media');
    return { handled: false, reason: 'STORAGE_FAILED' };
  }

  const descriptor = {
    mediaType: media.mediaType,
    mediaId,
    mimeType,
    fileName,
    fileSize: buffer.length,
    caption: media.info.caption || null,
    storageKey,
  };

  if (envelope && typeof envelope === 'object') {
    envelope.media = descriptor;
  }

  logger.info(
    { userId, phoneNumberId, messageId: message.id, mediaType: media.mediaType, size: buffer.length },
    'WhatsApp media stored',
  );

  return { handled: true, media: descriptor };
}

export const whatsappMediaService = {
  handleWhatsAppMediaMessage,
  SUPPORTED_MEDIA_TYPES,
  MAX_MEDIA_BYTES,
};