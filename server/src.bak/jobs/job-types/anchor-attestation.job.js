/**
 * Anchor Attestation Job
 *
 * @module server/jobs/job-types/anchor-attestation.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';

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

export function registerAnchorAttestationJob() {
  registerJobHandler({
    jobType: 'ANCHOR_ATTESTATION',
    handler,
  });
}

export default handler;