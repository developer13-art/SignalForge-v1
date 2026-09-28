/**
 * Index Solana Events Job
 *
 * @module server/jobs/job-types/index-solana-events.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';

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

export function registerIndexSolanaEventsJob() {
  registerJobHandler({
    jobType: 'INDEX_SOLANA_EVENTS',
    handler,
  });
}

export default handler;