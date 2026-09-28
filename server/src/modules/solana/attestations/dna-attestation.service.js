/**
 * DNA Attestation Service
 *
 * Anchors Provider DNA confidence and version on Solana. Invoked
 * when a Provider DNA update stabilizes.
 *
 * @module server/modules/solana/attestations/dna-attestation.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { attestationRepository } = require('./attestation.repository');
const { attestationBuilderService } = require('./attestation-builder.service');
const { programConfigService } = require('../config/program-config.service');
const { emitAttestationAnchored } = require('../solana.events');
async function createDnaAttestation({
  providerId,
  dnaConfidence,
  dnaVersion,
}) {
  if (!providerId || dnaConfidence === undefined) {
    throw new AppError('providerId and dnaConfidence are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const programId = programConfigService.tryGetProgramId({ key: 'attestation' });

  const { payload, attestationHash } = attestationBuilderService.buildDnaAttestationPayload({
    providerId,
    dnaConfidence,
    dnaVersion,
  });

  const record = await attestationRepository.insertAttestation({
    subjectType: 'PROVIDER',
    subjectId: providerId,
    attestationType: 'PROVIDER_DNA',
    attestationHash,
    publicData: payload.publicData,
    programId,
    status: 'PENDING',
  });

  logger.info({ attestationId: record.id, providerId, dnaVersion }, 'DNA attestation created');

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
async function markDnaAttestationAnchored({
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
const dnaAttestationService = {
  createDnaAttestation,
  markDnaAttestationAnchored,
};
module.exports.dnaAttestationService = dnaAttestationService;

module.exports.createDnaAttestation = createDnaAttestation;

module.exports.markDnaAttestationAnchored = markDnaAttestationAnchored;
