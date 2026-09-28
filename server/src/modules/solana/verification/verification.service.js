/**
 * Verification Service
 *
 * Top-level orchestration for verification operations. Combines
 * public verification with admin-level auditing.
 *
 * @module server/modules/solana/verification/verification.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { attestationRepository } = require('../attestations/attestation.repository');
const { provenanceRepository } = require('../provenance/provenance.repository');
const { publicVerificationService } = require('./public-verification.service');
const { onChainVerifierService } = require('./on-chain-verifier.service');
async function auditAttestation({ attestationId }) {
  if (!attestationId) {
    throw new AppError('attestationId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const attestation = await attestationRepository.findById({ attestationId });

  if (!attestation) {
    throw new AppError('Attestation not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const [onChain, transaction] = await Promise.all([
    onChainVerifierService.verifyAttestation({ attestation }),
    attestation.tx_signature
      ? onChainVerifierService.verifyTransactionIncluded({
          txSignature: attestation.tx_signature,
          expectedSlot: attestation.slot,
        })
      : Promise.resolve({ found: false }),
  ]);

  logger.info({ attestationId, onChain }, 'Attestation audited');

  return {
    attestationId,
    database: {
      status: attestation.status,
      attestationHash: attestation.attestation_hash,
      txSignature: attestation.tx_signature,
      slot: attestation.slot,
    },
    onChain,
    transaction,
  };
}
async function auditProvenance({ provenanceId }) {
  if (!provenanceId) {
    throw new AppError('provenanceId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const provenance = await provenanceRepository.findById({ provenanceId });

  if (!provenance) {
    throw new AppError('Provenance record not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const [onChain, transaction] = await Promise.all([
    onChainVerifierService.verifyProvenance({ provenance }),
    provenance.tx_signature
      ? onChainVerifierService.verifyTransactionIncluded({
          txSignature: provenance.tx_signature,
          expectedSlot: provenance.slot,
        })
      : Promise.resolve({ found: false }),
  ]);

  logger.info({ provenanceId, onChain }, 'Provenance audited');

  return {
    provenanceId,
    database: {
      status: provenance.status,
      processingHash: provenance.processing_hash,
      txSignature: provenance.tx_signature,
      slot: provenance.slot,
    },
    onChain,
    transaction,
  };
}
async function auditPendingRecords({ limit = 50 }) {
  const pendingAttestations = await attestationRepository.listPending({ limit });
  const pendingProvenance = await provenanceRepository.listPending({ limit });

  const results = {
    attestations: [],
    provenance: [],
  };

  for (const attestation of pendingAttestations) {
    const audit = await auditAttestation({ attestationId: attestation.id }).catch((err) => ({
      attestationId: attestation.id,
      error: err.message,
    }));
    results.attestations.push(audit);
  }

  for (const record of pendingProvenance) {
    const audit = await auditProvenance({ provenanceId: record.id }).catch((err) => ({
      provenanceId: record.id,
      error: err.message,
    }));
    results.provenance.push(audit);
  }

  return results;
}
const verificationService = {
  verifyByAttestationId: publicVerificationService.verifyByAttestationId,
  verifyByHash: publicVerificationService.verifyByHash,
  verifySignalBySignalId: publicVerificationService.verifySignalBySignalId,
  verifyByProcessingHash: publicVerificationService.verifyByProcessingHash,

  auditAttestation,
  auditProvenance,
  auditPendingRecords,
};
module.exports.verificationService = verificationService;

module.exports.auditAttestation = auditAttestation;

module.exports.auditProvenance = auditProvenance;

module.exports.auditPendingRecords = auditPendingRecords;
