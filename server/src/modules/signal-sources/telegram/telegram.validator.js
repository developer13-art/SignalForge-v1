/**
 * Telegram Validator
 *
 * Provides validation for Telegram-related requests including phone
 * numbers, OTP codes, channel selection, and session identifiers.
 *
 * @module server/modules/signal-sources/telegram/telegram.validator
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { normalizePhone, isValidE164 } from '@signalforge/shared/validators/phone.validator';

const PHONE_CODE_REGEX = /^\d{4,6}$/;
const TWO_FACTOR_PASSWORD_MIN_LENGTH = 1;
const TWO_FACTOR_PASSWORD_MAX_LENGTH = 256;
const MAX_CHANNELS_PER_REQUEST = 500;
const CHANNEL_ID_REGEX = /^-?\d{1,20}$/;

export function validatePhoneNumber(phoneNumber, countryCode) {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    throw new AppError('Phone number is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const normalized = normalizePhone(phoneNumber, countryCode);

  if (!normalized || !isValidE164(normalized)) {
    throw new AppError('Phone number is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return normalized;
}

export function validatePhoneCode(code) {
  if (!code || typeof code !== 'string') {
    throw new AppError('Phone code is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const trimmed = code.trim();

  if (!PHONE_CODE_REGEX.test(trimmed)) {
    throw new AppError('Phone code must be 4 to 6 digits', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return trimmed;
}

export function validateTwoFactorPassword(password) {
  if (password === undefined || password === null) {
    return null;
  }

  if (typeof password !== 'string') {
    throw new AppError('Two-factor password must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (
    password.length < TWO_FACTOR_PASSWORD_MIN_LENGTH ||
    password.length > TWO_FACTOR_PASSWORD_MAX_LENGTH
  ) {
    throw new AppError(
      `Two-factor password must be between ${TWO_FACTOR_PASSWORD_MIN_LENGTH} and ${TWO_FACTOR_PASSWORD_MAX_LENGTH} characters`,
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  return password;
}

export function validateSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') {
    throw new AppError('Session id is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (sessionId.length < 8 || sessionId.length > 128) {
    throw new AppError('Session id is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return sessionId;
}

export function validateChannelIds(channelIds) {
  if (!Array.isArray(channelIds)) {
    throw new AppError('Channel ids must be an array', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (channelIds.length === 0) {
    throw new AppError('At least one channel must be selected', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (channelIds.length > MAX_CHANNELS_PER_REQUEST) {
    throw new AppError(
      `No more than ${MAX_CHANNELS_PER_REQUEST} channels may be selected at once`,
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const normalized = channelIds.map((id) => {
    const stringId = String(id).trim();
    if (!CHANNEL_ID_REGEX.test(stringId)) {
      throw new AppError(`Invalid channel id: ${id}`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
    return stringId;
  });

  return Array.from(new Set(normalized));
}

export function validateCountryCode(countryCode) {
  if (!countryCode || typeof countryCode !== 'string') {
    throw new AppError('Country code is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const upper = countryCode.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(upper)) {
    throw new AppError('Country code must be a two-letter ISO code', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return upper;
}

export function validateInitiateLoginPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return {
    phoneNumber: validatePhoneNumber(payload.phoneNumber, payload.countryCode),
    countryCode: validateCountryCode(payload.countryCode),
  };
}

export function validateCompleteLoginPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return {
    sessionId: validateSessionId(payload.sessionId),
    code: validatePhoneCode(payload.code),
    password: validateTwoFactorPassword(payload.password),
  };
}

export function validateChannelSelectionPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return {
    channelIds: validateChannelIds(payload.channelIds),
  };
}

export const TELEGRAM_VALIDATION_CONSTRAINTS = Object.freeze({
  phoneCodeMinLength: 4,
  phoneCodeMaxLength: 6,
  twoFactorPasswordMinLength: TWO_FACTOR_PASSWORD_MIN_LENGTH,
  twoFactorPasswordMaxLength: TWO_FACTOR_PASSWORD_MAX_LENGTH,
  maxChannelsPerRequest: MAX_CHANNELS_PER_REQUEST,
});