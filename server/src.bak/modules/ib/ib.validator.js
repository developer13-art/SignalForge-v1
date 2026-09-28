/**
 * IB Validator
 *
 * Validation for IB payloads including link creation and referral
 * registration.
 *
 * @module server/modules/ib/ib.validator
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';

const MAX_LABEL_LENGTH = 128;
const MAX_DESTINATION_LENGTH = 512;
const MAX_SOURCE_LENGTH = 64;

export function validateCreateLinkPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let label = null;
  if (payload.label !== undefined && payload.label !== null) {
    if (typeof payload.label !== 'string') {
      throw new AppError('label must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    const trimmed = payload.label.trim();
    if (trimmed.length > MAX_LABEL_LENGTH) {
      throw new AppError(`label exceeds ${MAX_LABEL_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
    label = trimmed || null;
  }

  let destination = null;
  if (payload.destination !== undefined && payload.destination !== null) {
    if (typeof payload.destination !== 'string') {
      throw new AppError('destination must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    const trimmed = payload.destination.trim();
    if (trimmed.length > MAX_DESTINATION_LENGTH) {
      throw new AppError(`destination exceeds ${MAX_DESTINATION_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
    destination = trimmed || null;
  }

  let brokerId = null;
  if (payload.brokerId !== undefined && payload.brokerId !== null) {
    if (typeof payload.brokerId !== 'string') {
      throw new AppError('brokerId must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    brokerId = payload.brokerId.trim() || null;
  }

  return { label, destination, brokerId };
}

export function validateRegisterReferralPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.partnerUserId || typeof payload.partnerUserId !== 'string') {
    throw new AppError('partnerUserId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.referredUserId || typeof payload.referredUserId !== 'string') {
    throw new AppError('referredUserId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (payload.partnerUserId === payload.referredUserId) {
    throw new AppError('partnerUserId and referredUserId must differ', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let brokerAccountId = null;
  if (payload.brokerAccountId !== undefined && payload.brokerAccountId !== null) {
    if (typeof payload.brokerAccountId !== 'string') {
      throw new AppError('brokerAccountId must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    brokerAccountId = payload.brokerAccountId.trim() || null;
  }

  let source = null;
  if (payload.source !== undefined && payload.source !== null) {
    if (typeof payload.source !== 'string') {
      throw new AppError('source must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    const trimmed = payload.source.trim();
    if (trimmed.length > MAX_SOURCE_LENGTH) {
      throw new AppError(`source exceeds ${MAX_SOURCE_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
    source = trimmed || null;
  }

  return {
    partnerUserId: payload.partnerUserId,
    referredUserId: payload.referredUserId,
    brokerAccountId,
    source,
  };
}

export const IB_VALIDATION_CONSTRAINTS = Object.freeze({
  maxLabelLength: MAX_LABEL_LENGTH,
  maxDestinationLength: MAX_DESTINATION_LENGTH,
  maxSourceLength: MAX_SOURCE_LENGTH,
});