/**
 * Certification Attestation Service
 *
 * Anchors provider certification status on Solana. Called by the
 * provider certification workflow when a certification is created or
 * updated. Only public-safe fields are anchored.
 *
 * @module server/modules/solana/attestations/certification-attestation.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { attestationRepository } = require('./attestation.repository');
const { attestationBuilderService } = require('./attestation-builder.service');
const { programConfigService } = require('../config/program-config.service');
const { emitAttestationAnchored } = require('../solana.events');

export async function createCertificationAttestation({
  providerId,
  certificationStatus,
  certificationVersion,
  consistencyScore,
}) {
  if (!providerId || !certificationStatus) {
    throw new AppError(
      'providerId and certificationStatus are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const programId = programConfigService.tryGetProgramId({ key: 'attestation' });

  const { payload, attestationHash } = attestationBuilderService.buildCertificationAttestationPayload({
    providerId,
    certificationStatus,
    certificationVersion,
    consistencyScore,
  });

  const record = await attestationRepository.insertAttestation({
    subjectType: 'PROVIDER',
    subjectId: providerId,
    attestationType: 'PROVIDER_CERTIFICATION',
    attestationHash,
    publicData: payload.publicData,
    onChainData: null,
    programId,
    status: 'PENDING',
  });

  logger.info(
    { attestationId: record.id, providerId, certificationStatus },
    'Certification attestation created',
  );

  return {
    attestationId: record.id,
    subjectType: record.subject_type,
    subjectId: record.subject_id,
    attestationType: record.attestation_type,
    attestationHash: record.attestation_hash,
    status: record.status,
    createdAt: record.created_at,
  };
}

export async function markCertificationAttestationAnchored({
  attestationId,
  txSignature,
  slot,
  blockTime,
}) {
  const updated = await attestationRepository.updateStatus({
    attestationId,
    status: 'CONFIRMED',
    txSignature,
    slot,
    blockTime,
  });

  if (!updated) {
    throw new AppError('Attestation not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const record = await attestationRepository.findById({ attestationId });

  await emitAttestationAnchored({
    attestationId,
    subjectType: record.subject_type,
    subjectId: record.subject_id,
    txSignature,
    slot,
  }).catch((err) => logger.warn({ err }, 'Failed to emit attestation anchored event'));

  return { anchored: true, txSignature };
}
const certificationAttestationService = {
  createCertificationAttestation,
  markCertificationAttestationAnchored,
};
module.exports.certificationAttestationService = certificationAttestationService;
