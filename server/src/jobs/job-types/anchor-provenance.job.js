/**
 * Anchor Provenance Job
 *
 * @module server/jobs/job-types/anchor-provenance.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';

async function handler(payload) {
  if (!payload.provenanceId) {
    return;
  }

  logger.debug({ provenanceId: payload.provenanceId }, 'Anchoring provenance');

  try {
    const { provenanceAnchorService } = await import(
      '../../modules/solana/provenance/provenance-anchor.service'
    );

    if (provenanceAnchorService && typeof provenanceAnchorService.anchorProvenance === 'function') {
      await provenanceAnchorService.anchorProvenance({ provenanceId: payload.provenanceId });
    }
  } catch (err) {
    logger.warn({ err, provenanceId: payload.provenanceId }, 'Provenance anchor failed');
  }
}

export function registerAnchorProvenanceJob() {
  registerJobHandler({
    jobType: 'ANCHOR_PROVENANCE',
    handler,
  });
}

export default handler;