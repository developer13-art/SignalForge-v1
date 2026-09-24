/**
 * Message Controller
 *
 * HTTP handlers for querying raw source messages, fetching message
 * details, and listing processing status. All handlers enforce
 * authentication and authorization through middleware.
 *
 * @module server/modules/signal-sources/messages/message.controller
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { successResponse } from '../../../lib/response/success.response';
import { paginatedResponse } from '../../../lib/response/paginated.response';
import * as repository from './message-raw-store.service';
import { messageFingerprintService } from './message-fingerprint.service';

export async function listMessages(req, res) {
  const userId = req.user && req.user.id;
  const { sourceType, channelId, from, to, page, limit } = req.query;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await repository.listMessages({
    userId,
    filters: { sourceType, channelId, from, to },
    pagination: { page, limit },
  });

  return paginatedResponse(res, {
    items: result.items,
    meta: result.meta,
  });
}

export async function getMessage(req, res) {
  const userId = req.user && req.user.id;
  const { messageId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const message = await repository.getMessageById({ userId, messageId });

  if (!message) {
    throw new AppError('Message not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return successResponse(res, { message });
}

export async function getMessageProcessingStatus(req, res) {
  const userId = req.user && req.user.id;
  const { messageId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const status = await repository.getMessageProcessingStatus({ userId, messageId });

  if (!status) {
    throw new AppError('Message not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return successResponse(res, { status });
}

export async function getMessageFingerprint(req, res) {
  const userId = req.user && req.user.id;
  const { messageId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const fingerprint = await messageFingerprintService.computeFingerprint({ userId, messageId });

  if (!fingerprint) {
    throw new AppError('Message not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return successResponse(res, { fingerprint });
}

export async function reprocessMessage(req, res) {
  const userId = req.user && req.user.id;
  const { messageId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const result = await repository.enqueueForReprocessing({ userId, messageId });

  logger.info({ userId, messageId }, 'Message reprocessing enqueued');

  return successResponse(res, { enqueued: true, jobId: result.jobId });
}

export async function deleteMessage(req, res) {
  const userId = req.user && req.user.id;
  const { messageId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  await repository.softDeleteMessage({ userId, messageId });

  return successResponse(res, { deleted: true });
}

export const messageController = {
  listMessages,
  getMessage,
  getMessageProcessingStatus,
  getMessageFingerprint,
  reprocessMessage,
  deleteMessage,
};