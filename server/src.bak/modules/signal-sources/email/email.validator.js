/**
 * Email Validator
 *
 * Provides validation for inbound email integration including IMAP
 * configuration, mailbox selection, and parsed email headers.
 *
 * @module server/modules/signal-sources/email/email.validator
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { isValidEmail, normalizeEmail } from '@signalforge/shared/validators/email.validator';

const MAX_MAILBOX_LENGTH = 128;
const MAX_SUBJECT_LENGTH = 512;
const MAX_FROM_LENGTH = 320;
const MAX_BODY_BYTES = 512 * 1024;

export function validateMailbox(mailbox) {
  if (!mailbox || typeof mailbox !== 'string') {
    throw new AppError('Mailbox is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  const trimmed = mailbox.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_MAILBOX_LENGTH) {
    throw new AppError('Mailbox name is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return trimmed;
}

export function validateFromAddress(from) {
  if (!from || typeof from !== 'string') {
    throw new AppError('From address is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  if (from.length > MAX_FROM_LENGTH) {
    throw new AppError('From address is too long', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return from.trim();
}

export function validateSubject(subject) {
  if (subject === undefined || subject === null) {
    return '';
  }
  if (typeof subject !== 'string') {
    throw new AppError('Subject must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  if (subject.length > MAX_SUBJECT_LENGTH) {
    throw new AppError(`Subject exceeds ${MAX_SUBJECT_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return subject;
}

export function validateBodySize(body) {
  if (!body) {
    return 0;
  }
  const size = Buffer.isBuffer(body)
    ? body.length
    : Buffer.byteLength(String(body), 'utf8');
  if (size > MAX_BODY_BYTES) {
    throw new AppError(`Email body exceeds ${MAX_BODY_BYTES} bytes`, ERROR_CODES.EMAIL_BODY_TOO_LARGE, 413);
  }
  return size;
}

export function validateImapConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new AppError('IMAP configuration is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const host = config.host ? String(config.host).trim() : null;
  const port = Number(config.port);
  const user = config.user ? String(config.user).trim() : null;
  const password = config.password ? String(config.password) : null;
  const secure = config.secure === undefined ? true : Boolean(config.secure);

  if (!host) {
    throw new AppError('IMAP host is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new AppError('IMAP port is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!user) {
    throw new AppError('IMAP user is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!password) {
    throw new AppError('IMAP password is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return { host, port, user, password, secure };
}

export function validateSmtpConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new AppError('SMTP configuration is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const host = config.host ? String(config.host).trim() : null;
  const port = Number(config.port);
  const user = config.user ? String(config.user).trim() : null;
  const password = config.password ? String(config.password) : null;
  const secure = config.secure === undefined ? false : Boolean(config.secure);
  const fromAddress = config.fromAddress ? normalizeEmail(config.fromAddress) : null;
  const fromName = config.fromName ? String(config.fromName).trim() : 'SignalForge';

  if (!host) {
    throw new AppError('SMTP host is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new AppError('SMTP port is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (fromAddress && !isValidEmail(fromAddress)) {
    throw new AppError('SMTP from address is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return { host, port, user, password, secure, fromAddress, fromName };
}

export function validateEmailAddress(address) {
  if (!address || typeof address !== 'string') {
    throw new AppError('Email address is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  const normalized = normalizeEmail(address);
  if (!normalized || !isValidEmail(normalized)) {
    throw new AppError('Email address is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return normalized;
}

export const EMAIL_VALIDATION_CONSTRAINTS = Object.freeze({
  maxMailboxLength: MAX_MAILBOX_LENGTH,
  maxSubjectLength: MAX_SUBJECT_LENGTH,
  maxFromLength: MAX_FROM_LENGTH,
  maxBodyBytes: MAX_BODY_BYTES,
});