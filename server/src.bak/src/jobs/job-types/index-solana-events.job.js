/**
 * Index Solana Events Job
 *
 * @module server/jobs/job-types/index-solana-events.job
 */
const { registerJobHandler } = require('../job-registry');
const { logger } = require('../../lib/logger');

async function handler() {
  try {
    const { indexerRecoveryService } = await import(
      '../../modules/solana/indexer/indexer-recovery.service'
    );

    if (indexerRecoveryService && typeof indexerRecoveryService.recoverAll === 'function') {
      const result = await indexerRecoveryService.recoverAll({ maxSlotsPerProgram: 20 });
      logger.debug({ result }, 'Solana events indexed');
    }
  } catch (err) {
    logger.warn({ err }, 'Solana event index failed');
  }
}
function registerIndexSolanaEventsJob() {
  registerJobHandler({
    jobType: 'INDEX_SOLANA_EVENTS',
    handler,
  });
}
module.exports = handler;
module.exports.registerIndexSolanaEventsJob = registerIndexSolanaEventsJob;
