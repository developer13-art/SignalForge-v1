/**
 * Email Attachment Service
 *
 * Handles attachments found in inbound email messages. Each attachment
 * is stored in private object storage under a stable key, and a
 * normalized descriptor is returned for downstream processing.
 *
 * @module server/modules/signal-sources/email/email-attachment.service
 */

import crypto from 'node:crypto';
import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { storageService } from '../../../lib/storage';

const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
const MAX_ATTACHMENTS_PER_MESSAGE = 20;

const ALLOWED_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
]);

function buildStorageKey({ userId, mailbox, messageId, fileName, index }) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(6).toString('hex');
  const safeName = (fileName || `attachment-${index}`).replace(/[^\w.\-]+/g, '_').slice(0, 64);
  return `email/${userId}/${mailbox}/${messageId}/${timestamp}-${random}-${safeName}`;
}

export async function handleEmailAttachments({ userId, mailbox, messageId, attachments }) {
  if (!userId || !mailbox || !messageId) {
    throw new AppError('userId, mailbox, and messageId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!Array.isArray(attachments) || attachments.length === 0) {
    return { attachments: [] };
  }

  if (attachments.length > MAX_ATTACHMENTS_PER_MESSAGE) {
    throw new AppError(
      `Email message contains more than ${MAX_ATTACHMENTS_PER_MESSAGE} attachments`,
      ERROR_CODES.EMAIL_ATTACHMENT_LIMIT_EXCEEDED,
      400,
    );
  }

  const results = [];

  for (let index = 0; index < attachments.length; index++) {
    const attachment = attachments[index];
    const content = attachment.content;

    if (!content) {
      results.push({
        index,
        fileName: attachment.filename || null,
        contentType: attachment.contentType || null,
        skipped: true,
        reason: 'NO_CONTENT',
      });
      continue;
    }

    const size = Buffer.isBuffer(content) ? content.length : 0;

    if (size > MAX_ATTACHMENT_BYTES) {
      results.push({
        index,
        fileName: attachment.filename || null,
        contentType: attachment.contentType || null,
        sizeBytes: size,
        skipped: true,
        reason: 'TOO_LARGE',
      });
      continue;
    }

    if (attachment.contentType && !ALLOWED_MIME_TYPES.includes(attachment.contentType)) {
      results.push({
        index,
        fileName: attachment.filename || null,
        contentType: attachment.contentType,
        sizeBytes: size,
        skipped: true,
        reason: 'UNSUPPORTED_TYPE',
      });
      continue;
    }

    const storageKey = buildStorageKey({
      userId,
      mailbox,
      messageId,
      fileName: attachment.filename,
      index,
    });

    try {
      await storageService.uploadPrivate({
        key: storageKey,
        body: content,
        contentType: attachment.contentType || 'application/octet-stream',
      });
    } catch (err) {
      logger.error({ err, userId, storageKey }, 'Failed to store email attachment');
      results.push({
        index,
        fileName: attachment.filename || null,
        contentType: attachment.contentType || null,
        sizeBytes: size,
        skipped: true,
        reason: 'STORAGE_FAILED',
      });
      continue;
    }

    results.push({
      index,
      fileName: attachment.filename || null,
      contentType: attachment.contentType || null,
      sizeBytes: size,
      storageKey,
      skipped: false,
    });
  }

  logger.info({ userId, mailbox, messageId, count: results.length }, 'Email attachments processed');

  return { attachments: results };
}

export const emailAttachmentService = {
  handleEmailAttachments,
  ALLOWED_MIME_TYPES,
  MAX_ATTACHMENT_BYTES,
};