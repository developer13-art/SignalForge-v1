/**
 * Reputation Attestation Service
 *
 * Anchors provider reputation metrics on Solana. Called by the
 * provider reputation workflow on a rolling schedule.
 *
 * @module server/modules/solana/attestations/reputation-attestation.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { attestationRepository } = require('./attestation.repository');
const { attestationBuilderService } = require('./attestation-builder.service');
const { programConfigService } = require('../config/program-config.service');
const { emitAttestationAnchored } = require('../solana.events');
async function createReputationAttestation({
  providerId,
  consistencyScore,
  performanceScore,
}) {
  if (!providerId) {
    throw new AppError('providerId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const programId = programConfigService.tryGetProgramId({ key: 'attestation' });

  const { payload, attestationHash } = attestationBuilderService.buildReputationAttestationPayload({
    providerId,
    consistencyScore,
    performanceScore,
  });

  const record = await attestationRepository.insertAttestation({
    subjectType: 'PROVIDER',
    subjectId: providerId,
    attestationType: 'PROVIDER_REPUTATION',
    attestationHash,
    publicData: payload.publicData,
    programId,
    status: 'PENDING',
  });

  logger.info({ attestationId: record.id, providerId }, 'Reputation attestation created');

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
async function markReputationAttestationAnchored({
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
const reputationAttestationService = {
  createReputationAttestation,
  markReputationAttestationAnchored,
};
module.exports.reputationAttestationService = reputationAttestationService;

module.exports.createReputationAttestation = createReputationAttestation;

module.exports.markReputationAttestationAnchored = markReputationAttestationAnchored;
