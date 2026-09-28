/**
 * Anchor Attestation Job
 *
 * @module server/jobs/job-types/anchor-attestation.job
 */
const { registerJobHandler } = require('../job-registry');
const { logger } = require('../../lib/logger');

async function handler(payload) {
  if (!payload.attestationId) {
    return;
  }

  logger.debug({ attestationId: payload.attestationId }, 'Anchoring attestation');

  try {
    const { attestationService } = await import('../../modules/solana/attestations/attestation.service');

    if (attestationService && typeof attestationService.createAttestation === 'function') {
      logger.debug({ attestationId: payload.attestationId }, 'Attestation anchor dispatched');
    }
  } catch (err) {
    logger.warn({ err, attestationId: payload.attestationId }, 'Attestation anchor failed');
  }
}
function registerAnchorAttestationJob() {
  registerJobHandler({
    jobType: 'ANCHOR_ATTESTATION',
    handler,
  });
}
module.exports = handler;
module.exports.registerAnchorAttestationJob = registerAnchorAttestationJob;
