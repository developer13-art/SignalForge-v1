/**
 * Compute Consensus Job
 *
 * @module server/jobs/job-types/compute-consensus.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { publishEvent } from '../../events/event-publisher';

async function handler(payload) {
  if (!payload.symbol) {
    return;
  }

  logger.debug({ symbol: payload.symbol }, 'Computing consensus');

  await publishEvent({
    eventType: EVENT_TYPES.CONSENSUS_REACHED,
    source: 'compute-consensus.job',
    actorId: null,
    payload: {
      symbol: payload.symbol,
      direction: payload.direction || null,
      agreementCount: payload.agreementCount || 0,
    },
  });
}

export function registerComputeConsensusJob() {
  registerJobHandler({
    jobType: 'COMPUTE_CONSENSUS',
    handler,
  });
}

export default handler;