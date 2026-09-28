/**
 * Compute Consensus Job
 *
 * @module server/jobs/job-types/compute-consensus.job
 */
const { registerJobHandler } = require('../job-registry');
const { logger } = require('../../lib/logger');
const { EVENT_TYPES } = require('@signalforge/shared/constants/event-types');
const { publishEvent } = require('../../events/event-publisher');

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
function registerComputeConsensusJob() {
  registerJobHandler({
    jobType: 'COMPUTE_CONSENSUS',
    handler,
  });
}
module.exports = handler;
module.exports.registerComputeConsensusJob = registerComputeConsensusJob;
