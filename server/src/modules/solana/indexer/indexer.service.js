/**
 * Indexer Service
 *
 * Top-level orchestration for the Solana indexer. Coordinates the
 * event listener, checkpoint persistence, and recovery operations.
 *
 * @module server/modules/solana/indexer/indexer.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { eventListenerService } from './event-listener.service';
import { indexerCheckpointService } from './indexer-checkpoint.service';
import { indexerRecoveryService } from './indexer-recovery.service';

let running = false;

export async function startIndexer() {
  if (running) {
    return { running: true, alreadyRunning: true };
  }

  logger.info('Starting Solana indexer');

  const programs = ['attestation', 'provenance', 'payment'];

  const listeners = [];

  for (const programKey of programs) {
    try {
      const result = await eventListenerService.startListening({ programKey });
      listeners.push({ programKey, ...result });
    } catch (err) {
      logger.warn({ err, programKey }, 'Failed to start listener');
      listeners.push({ programKey, listening: false, error: err.message });
    }
  }

  running = true;

  return { running: true, listeners };
}

export async function stopIndexer() {
  if (!running) {
    return { running: false, alreadyStopped: true };
  }

  await eventListenerService.stopAll();

  running = false;

  logger.info('Solana indexer stopped');

  return { running: false };
}

export function isRunning() {
  return running;
}

export async function getIndexerStatus() {
  const [checkpoints, listeners] = await Promise.all([
    indexerCheckpointService.getCheckpoints(),
    Promise.resolve(eventListenerService.listActiveListeners()),
  ]);

  return {
    running,
    checkpoints,
    listeners,
    checkedAt: new Date().toISOString(),
  };
}

export async function triggerRecovery({ programKey, maxSlots } = {}) {
  if (programKey) {
    return indexerRecoveryService.recoverFromCheckpoint({ programKey, maxSlots });
  }
  return indexerRecoveryService.recoverAll({ maxSlotsPerProgram: maxSlots });
}

export const indexerService = {
  startIndexer,
  stopIndexer,
  isRunning,
  getIndexerStatus,
  triggerRecovery,
};