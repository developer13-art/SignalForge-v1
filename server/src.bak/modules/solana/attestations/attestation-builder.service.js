/**
 * Attestation Builder Service
 *
 * Constructs the canonical payload for an attestation and computes
 * its cryptographic hash. The hash is what gets anchored on-chain;
 * the payload itself stays off-chain or is reduced to public fields.
 *
 * @module server/modules/solana/attestations/attestation-builder.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { hashObject } from '@signalforge/shared/utils/hash.util';
import {
  SOLANA_ATTESTATION_PUBLIC_FIELD_WHITELIST,
} from '../solana.constants';

function sanitizePublicData({ publicData }) {
  if (!publicData || typeof publicData !== 'object') {
    return null;
  }

  const sanitized = {};

  for (const key of SOLANA_ATTESTATION_PUBLIC_FIELD_WHITELIST) {
    if (publicData[key] !== undefined) {
      sanitized[key] = publicData[key];
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : null;
}

export function buildAttestationPayload({
  subjectType,
  subjectId,
  attestationType,
  publicData,
  onChainData,
  issuedAt,
}) {
  if (!subjectType || !subjectId || !attestationType) {
    throw new AppError(
      'subjectType, subjectId, and attestationType are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const publicFields = sanitizePublicData({ publicData });

  const payload = {
    subjectType,
    subjectId,
    attestationType,
    publicData: publicFields,
    onChainData: onChainData || null,
    issuedAt: issuedAt || new Date().toISOString(),
  };

  const attestationHash = hashObject({
    subjectType,
    subjectId,
    attestationType,
    publicData: publicFields,
    onChainData: onChainData || null,
  });

  return { payload, attestationHash, publicFields };
}

export function buildCertificationAttestationPayload({
  providerId,
  certificationStatus,
  certificationVersion,
  consistencyScore,
  issuedAt,
}) {
  return buildAttestationPayload({
    subjectType: 'PROVIDER',
    subjectId: providerId,
    attestationType: 'PROVIDER_CERTIFICATION',
    publicData: {
      providerId,
      certificationStatus,
      certificationVersion,
      consistencyScore,
      verifiedAt: issuedAt || new Date().toISOString(),
    },
    issuedAt,
  });
}

export function buildDnaAttestationPayload({
  providerId,
  dnaConfidence,
  dnaVersion,
  issuedAt,
}) {
  return buildAttestationPayload({
    subjectType: 'PROVIDER',
    subjectId: providerId,
    attestationType: 'PROVIDER_DNA',
    publicData: {
      providerId,
      dnaConfidence,
      dnaVersion,
      verifiedAt: issuedAt || new Date().toISOString(),
    },
    issuedAt,
  });
}

export function buildReputationAttestationPayload({
  providerId,
  consistencyScore,
  performanceScore,
  issuedAt,
}) {
  return buildAttestationPayload({
    subjectType: 'PROVIDER',
    subjectId: providerId,
    attestationType: 'PROVIDER_REPUTATION',
    publicData: {
      providerId,
      consistencyScore,
      performanceScore,
      verifiedAt: issuedAt || new Date().toISOString(),
    },
    issuedAt,
  });
}

export function buildSignalProvenanceAttestationPayload({
  signalId,
  processingHash,
  aiVersion,
  providerId,
  issuedAt,
}) {
  return buildAttestationPayload({
    subjectType: 'SIGNAL',
    subjectId: signalId,
    attestationType: 'SIGNAL_PROVENANCE',
    publicData: {
      signalId,
      processingHash,
      aiVersion,
      providerId,
      verifiedAt: issuedAt || new Date().toISOString(),
    },
    issuedAt,
  });
}

export const attestationBuilderService = {
  buildAttestationPayload,
  buildCertificationAttestationPayload,
  buildDnaAttestationPayload,
  buildReputationAttestationPayload,
  buildSignalProvenanceAttestationPayload,
};