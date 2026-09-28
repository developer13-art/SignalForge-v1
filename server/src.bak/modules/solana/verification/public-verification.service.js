/**
 * Public Verification Service
 *
 * Exposes read-only verification endpoints for third parties. Given
 * a hash, attestation ID, or signal ID, the service returns the
 * public-safe verification record and a link to Solana Explorer.
 * No sensitive data is exposed.
 *
 * @module server/modules/solana/verification/public-verification.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { attestationRepository } from '../attestations/attestation.repository';
import { provenanceRepository } from '../provenance/provenance.repository';
import { networkService } from '../config/network.service';
import { onChainVerifierService } from './on-chain-verifier.service';

function buildPublicAttestationRecord({ attestation }) {
  return {
    attestationId: attestation.id,
    subjectType: attestation.subject_type,
    subjectId: attestation.subject_id,
    attestationType: attestation.attestation_type,
    attestationHash: attestation.attestation_hash,
    publicData: attestation.public_data ? JSON.parse(attestation.public_data) : null,
    txSignature: attestation.tx_signature,
    slot: attestation.slot,
    status: attestation.status,
    confirmedAt: attestation.confirmed_at,
    createdAt: attestation.created_at,
  };
}

function buildPublicProvenanceRecord({ provenance }) {
  return {
    provenanceId: provenance.id,
    signalId: provenance.signal_id,
    providerId: provenance.provider_id,
    processingHash: provenance.processing_hash,
    signalHash: provenance.signal_hash,
    aiVersion: provenance.ai_version,
    txSignature: provenance.tx_signature,
    slot: provenance.slot,
    status: provenance.status,
    anchoredAt: provenance.anchored_at,
    createdAt: provenance.created_at,
  };
}

export async function verifyByAttestationId({ attestationId }) {
  if (!attestationId) {
    throw new AppError('attestationId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const attestation = await attestationRepository.findById({ attestationId });

  if (!attestation) {
    throw new AppError('Attestation not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const onChain = await onChainVerifierService.verifyAttestation({ attestation }).catch((err) => {
    logger.warn({ err, attestationId }, 'On-chain attestation verification failed');
    return { verified: false, reason: 'VERIFICATION_ERROR' };
  });

  const explorerUrl = attestation.tx_signature
    ? networkService.buildExplorerTxUrl({ txSignature: attestation.tx_signature })
    : null;

  return {
    record: buildPublicAttestationRecord({ attestation }),
    onChain,
    explorerUrl,
  };
}

export async function verifyByHash({ attestationHash }) {
  if (!attestationHash) {
    throw new AppError('attestationHash is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const attestation = await attestationRepository.findByHash({ attestationHash });

  if (!attestation) {
    throw new AppError('Attestation not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const onChain = await onChainVerifierService.verifyAttestation({ attestation }).catch((err) => {
    logger.warn({ err, attestationHash }, 'On-chain attestation verification failed');
    return { verified: false, reason: 'VERIFICATION_ERROR' };
  });

  const explorerUrl = attestation.tx_signature
    ? networkService.buildExplorerTxUrl({ txSignature: attestation.tx_signature })
    : null;

  return {
    record: buildPublicAttestationRecord({ attestation }),
    onChain,
    explorerUrl,
  };
}

export async function verifySignalBySignalId({ signalId }) {
  if (!signalId) {
    throw new AppError('signalId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const provenance = await provenanceRepository.findBySignalId({ signalId });

  if (!provenance) {
    throw new AppError('Provenance record not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const onChain = await onChainVerifierService.verifyProvenance({ provenance }).catch((err) => {
    logger.warn({ err, signalId }, 'On-chain provenance verification failed');
    return { verified: false, reason: 'VERIFICATION_ERROR' };
  });

  const explorerUrl = provenance.tx_signature
    ? networkService.buildExplorerTxUrl({ txSignature: provenance.tx_signature })
    : null;

  return {
    record: buildPublicProvenanceRecord({ provenance }),
    onChain,
    explorerUrl,
  };
}

export async function verifyByProcessingHash({ processingHash }) {
  if (!processingHash) {
    throw new AppError('processingHash is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const provenance = await provenanceRepository.findByProcessingHash({ processingHash });

  if (!provenance) {
    throw new AppError('Provenance record not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const onChain = await onChainVerifierService.verifyProvenance({ provenance }).catch((err) => {
    logger.warn({ err, processingHash }, 'On-chain provenance verification failed');
    return { verified: false, reason: 'VERIFICATION_ERROR' };
  });

  const explorerUrl = provenance.tx_signature
    ? networkService.buildExplorerTxUrl({ txSignature: provenance.tx_signature })
    : null;

  return {
    record: buildPublicProvenanceRecord({ provenance }),
    onChain,
    explorerUrl,
  };
}

export const publicVerificationService = {
  verifyByAttestationId,
  verifyByHash,
  verifySignalBySignalId,
  verifyByProcessingHash,
};