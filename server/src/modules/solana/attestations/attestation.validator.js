/**
 * Attestation Validator
 *
 * @module server/modules/solana/attestations/attestation.validator
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';

const VALID_SUBJECT_TYPES = ['PROVIDER', 'SIGNAL', 'TRADE', 'CONSENSUS'];
const VALID_ATTESTATION_TYPES = [
  'PROVIDER_CERTIFICATION',
  'PROVIDER_DNA',
  'PROVIDER_REPUTATION',
  'SIGNAL_PROVENANCE',
  'TRADE_PROVENANCE',
  'CONSENSUS_RECORD',
];

const MAX_SUBJECT_ID_LENGTH = 128;
const MAX_REVOCATION_REASON_LENGTH = 512;

export function validateCreateAttestationPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.subjectType || !VALID_SUBJECT_TYPES.includes(payload.subjectType)) {
    throw new AppError(`Invalid subjectType: ${payload.subjectType}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.subjectId || typeof payload.subjectId !== 'string') {
    throw new AppError('subjectId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (payload.subjectId.length > MAX_SUBJECT_ID_LENGTH) {
    throw new AppError(`subjectId must not exceed ${MAX_SUBJECT_ID_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.attestationType || !VALID_ATTESTATION_TYPES.includes(payload.attestationType)) {
    throw new AppError(`Invalid attestationType: ${payload.attestationType}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let publicData = null;
  if (payload.publicData !== undefined && payload.publicData !== null) {
    if (typeof payload.publicData !== 'object') {
      throw new AppError('publicData must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    publicData = payload.publicData;
  }

  let onChainData = null;
  if (payload.onChainData !== undefined && payload.onChainData !== null) {
    if (typeof payload.onChainData !== 'object') {
      throw new AppError('onChainData must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    onChainData = payload.onChainData;
  }

  return {
    subjectType: payload.subjectType,
    subjectId: payload.subjectId,
    attestationType: payload.attestationType,
    publicData,
    onChainData,
  };
}

export function validateRevokeAttestationPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let reason = null;
  if (payload.reason !== undefined && payload.reason !== null) {
    if (typeof payload.reason !== 'string') {
      throw new AppError('reason must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    if (payload.reason.length > MAX_REVOCATION_REASON_LENGTH) {
      throw new AppError(`reason must not exceed ${MAX_REVOCATION_REASON_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
    reason = payload.reason;
  }

  return { reason };
}

export const ATTESTATION_VALIDATION_CONSTRAINTS = Object.freeze({
  validSubjectTypes: VALID_SUBJECT_TYPES,
  validAttestationTypes: VALID_ATTESTATION_TYPES,
  maxSubjectIdLength: MAX_SUBJECT_ID_LENGTH,
  maxRevocationReasonLength: MAX_REVOCATION_REASON_LENGTH,
});