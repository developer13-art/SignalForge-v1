/**
 * WhatsApp Validator
 *
 * Provides validation for WhatsApp-related requests including phone
 * number identifiers, WhatsApp Business Account identifiers, Cloud API
 * webhook payloads, and message signatures.
 *
 * @module server/modules/signal-sources/whatsapp/whatsapp.validator
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { normalizePhone, isValidE164 } from '@signalforge/shared/validators/phone.validator';

const PHONE_NUMBER_ID_REGEX = /^\d{10,20}$/;
const WABA_ID_REGEX = /^\d{10,25}$/;
const MAX_MESSAGE_TEXT_LENGTH = 4096;
const MAX_GROUP_NAME_LENGTH = 128;

export function validatePhoneNumberId(phoneNumberId) {
  if (!phoneNumberId) {
    throw new AppError('phoneNumberId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  const asString = String(phoneNumberId).trim();
  if (!PHONE_NUMBER_ID_REGEX.test(asString)) {
    throw new AppError('phoneNumberId is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return asString;
}

export function validateBusinessAccountId(businessAccountId) {
  if (!businessAccountId) {
    throw new AppError('businessAccountId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  const asString = String(businessAccountId).trim();
  if (!WABA_ID_REGEX.test(asString)) {
    throw new AppError('businessAccountId is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return asString;
}

export function validateWhatsAppPhone(phone, countryCode) {
  if (!phone || typeof phone !== 'string') {
    throw new AppError('Phone number is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  const normalized = normalizePhone(phone, countryCode);
  if (!normalized || !isValidE164(normalized)) {
    throw new AppError('Phone number is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return normalized;
}

export function validateGroupId(groupId) {
  if (!groupId || typeof groupId !== 'string') {
    throw new AppError('groupId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  const trimmed = groupId.trim();
  if (trimmed.length < 5 || trimmed.length > 128) {
    throw new AppError('groupId is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return trimmed;
}

export function validateGroupName(groupName) {
  if (!groupName || typeof groupName !== 'string') {
    throw new AppError('groupName is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  const trimmed = groupName.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_GROUP_NAME_LENGTH) {
    throw new AppError('groupName is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return trimmed;
}

export function validateMessageText(text) {
  if (typeof text !== 'string') {
    throw new AppError('Message text must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  if (text.length > MAX_MESSAGE_TEXT_LENGTH) {
    throw new AppError(`Message text exceeds ${MAX_MESSAGE_TEXT_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return text;
}

export function validateCloudWebhookPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Webhook payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.object) {
    throw new AppError('Webhook payload is missing object field', ERROR_CODES.WHATSAPP_WEBHOOK_INVALID, 400);
  }

  if (payload.object !== 'whatsapp_business_account') {
    throw new AppError('Webhook payload object is not whatsapp_business_account', ERROR_CODES.WHATSAPP_WEBHOOK_INVALID, 400);
  }

  if (!Array.isArray(payload.entry)) {
    throw new AppError('Webhook payload entry must be an array', ERROR_CODES.WHATSAPP_WEBHOOK_INVALID, 400);
  }

  return payload;
}

export function validateWebhookSignature(signature, rawBody, appSecret) {
  if (!signature || typeof signature !== 'string') {
    throw new AppError('Webhook signature is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  if (!appSecret || typeof appSecret !== 'string') {
    throw new AppError('WhatsApp app secret is not configured', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }
  if (!rawBody) {
    throw new AppError('Webhook body is required for verification', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return { signature, rawBody, appSecret };
}

export function validateSubscriptionPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Subscription payload is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return {
    phoneNumberId: validatePhoneNumberId(payload.phoneNumberId),
    businessAccountId: validateBusinessAccountId(payload.businessAccountId),
    accessToken: payload.accessToken ? String(payload.accessToken) : null,
  };
}

export function validateGroupOptInPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  if (!Array.isArray(payload.groupIds) || payload.groupIds.length === 0) {
    throw new AppError('groupIds must be a non-empty array', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return {
    groupIds: payload.groupIds.map((id) => validateGroupId(id)),
  };
}

export const WHATSAPP_VALIDATION_CONSTRAINTS = Object.freeze({
  phoneNumberIdPattern: PHONE_NUMBER_ID_REGEX.source,
  businessAccountIdPattern: WABA_ID_REGEX.source,
  maxMessageTextLength: MAX_MESSAGE_TEXT_LENGTH,
  maxGroupNameLength: MAX_GROUP_NAME_LENGTH,
});