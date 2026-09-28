/**
 * Ticket Validator
 *
 * Validation for support ticket payloads, message additions, and
 * status updates.
 *
 * @module server/modules/support/ticket.validator
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import {
  TICKET_PRIORITY_VALUES,
  TICKET_CATEGORY_VALUES,
  TICKET_STATUS_VALUES,
  MAX_SUBJECT_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_ATTACHMENTS_PER_MESSAGE,
} from './ticket.constants';

export function validateCreateTicketPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.subject || typeof payload.subject !== 'string') {
    throw new AppError('Subject is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const subject = payload.subject.trim();

  if (subject.length === 0 || subject.length > MAX_SUBJECT_LENGTH) {
    throw new AppError(`Subject must be between 1 and ${MAX_SUBJECT_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.message || typeof payload.message !== 'string') {
    throw new AppError('Message is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const message = payload.message.trim();

  if (message.length === 0 || message.length > MAX_MESSAGE_LENGTH) {
    throw new AppError(`Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const priority = payload.priority || 'NORMAL';
  if (!TICKET_PRIORITY_VALUES.includes(priority)) {
    throw new AppError(`Invalid priority: ${priority}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const category = payload.category || 'GENERAL';
  if (!TICKET_CATEGORY_VALUES.includes(category)) {
    throw new AppError(`Invalid category: ${category}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let attachments = [];
  if (Array.isArray(payload.attachments)) {
    if (payload.attachments.length > MAX_ATTACHMENTS_PER_MESSAGE) {
      throw new AppError(`No more than ${MAX_ATTACHMENTS_PER_MESSAGE} attachments are allowed`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
    attachments = payload.attachments.map((a) => ({
      fileName: a.fileName ? String(a.fileName).substring(0, 128) : null,
      mimeType: a.mimeType ? String(a.mimeType).substring(0, 64) : null,
      sizeBytes: Number(a.sizeBytes) || 0,
      storageKey: a.storageKey ? String(a.storageKey).substring(0, 512) : null,
    }));
  }

  return {
    subject,
    message,
    priority,
    category,
    attachments,
    metadata: payload.metadata || null,
  };
}

export function validateAddMessagePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.message || typeof payload.message !== 'string') {
    throw new AppError('Message is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const message = payload.message.trim();

  if (message.length === 0 || message.length > MAX_MESSAGE_LENGTH) {
    throw new AppError(`Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let attachments = [];
  if (Array.isArray(payload.attachments)) {
    if (payload.attachments.length > MAX_ATTACHMENTS_PER_MESSAGE) {
      throw new AppError(`No more than ${MAX_ATTACHMENTS_PER_MESSAGE} attachments are allowed`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
    attachments = payload.attachments.map((a) => ({
      fileName: a.fileName ? String(a.fileName).substring(0, 128) : null,
      mimeType: a.mimeType ? String(a.mimeType).substring(0, 64) : null,
      sizeBytes: Number(a.sizeBytes) || 0,
      storageKey: a.storageKey ? String(a.storageKey).substring(0, 512) : null,
    }));
  }

  return { message, attachments };
}

export function validateStatusUpdatePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.status || typeof payload.status !== 'string') {
    throw new AppError('Status is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!TICKET_STATUS_VALUES.includes(payload.status)) {
    throw new AppError(`Invalid status: ${payload.status}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return {
    status: payload.status,
    reason: payload.reason ? String(payload.reason).substring(0, 512) : null,
  };
}

export function validatePriorityUpdatePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.priority || typeof payload.priority !== 'string') {
    throw new AppError('Priority is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!TICKET_PRIORITY_VALUES.includes(payload.priority)) {
    throw new AppError(`Invalid priority: ${payload.priority}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return { priority: payload.priority };
}

export function validateAssignPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.agentId || typeof payload.agentId !== 'string') {
    throw new AppError('agentId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return { agentId: payload.agentId.trim() };
}

export const TICKET_VALIDATION_CONSTRAINTS = Object.freeze({
  maxSubjectLength: MAX_SUBJECT_LENGTH,
  maxMessageLength: MAX_MESSAGE_LENGTH,
  maxAttachmentsPerMessage: MAX_ATTACHMENTS_PER_MESSAGE,
});