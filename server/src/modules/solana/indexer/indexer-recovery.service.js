/**
 * Indexer Recovery Service
 *
 * Recovers from indexer downtime by replaying signatures between the
 * last checkpoint and the current chain head. Processes missed slots
 * in bounded batches.
 *
 * @module server/modules/solana/indexer/indexer-recovery.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { connectionService } from '../config/connection.service';
import { programConfigService } from '../config/program-config.service';
import { indexerCheckpointService } from './indexer-checkpoint.service';
import { programEventProcessorService } from './program-event-processor.service';

const DEFAULT_BATCH_SIZE = 50;
const MAX_SLOTS_PER_RECOVERY = 1000;

async function loadWeb3() {
  try {
    const module = await import('@solana/web3.js');
    if (!module || !module.PublicKey) {
      throw new Error('PublicKey missing');
    }
    return module;
  } catch (err) {
    throw new AppError('Solana web3 library is not available', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }
}

async function fetchSignaturesForProgram({ programId, before, until }) {
  const connection = await connectionService.getConnection();
  const web3 = await loadWeb3();

  const signatures = await connection.getSignaturesForAddress(
    new web3.PublicKey(programId),
    {
      before,
      until,
      limit: DEFAULT_BATCH_SIZE,
    },
    'confirmed',
  );

  return signatures;
}

async function fetchTransaction({ txSignature }) {
  const connection = await connectionService.getConnection();
  return connection.getTransaction(txSignature, {
    commitment: 'confirmed',
    maxSupportedTransactionVersion: 0,
  });
}

export async function recoverFromCheckpoint({ programKey = 'attestation', maxSlots = MAX_SLOTS_PER_RECOVERY }) {
  const programId = programConfigService.tryGetProgramId({ key: programKey });

  if (!programId) {
    return { recovered: false, reason: 'PROGRAM_NOT_CONFIGURED' };
  }

  const checkpoint = await indexerCheckpointService.getCheckpoint({ programId });

  logger.info(
    { programKey, programId, fromSlot: checkpoint.lastProcessedSlot },
    'Starting indexer recovery',
  );

  let processedCount = 0;
  let lastSlot = checkpoint.lastProcessedSlot || 0;

  let before = null;

  try {
    while (processedCount < maxSlots) {
      const signatures = await fetchSignaturesForProgram({ programId, before, until: null });

      if (signatures.length === 0) {
        break;
      }

      for (const sig of signatures) {
        if (sig.slot <= lastSlot) {
          continue;
        }

        if (sig.err) {
          continue;
        }

        let tx;
        try {
          tx = await fetchTransaction({ txSignature: sig.signature });
        } catch (err) {
          logger.warn({ err, signature: sig.signature }, 'Failed to fetch transaction during recovery');
          continue;
        }

        if (!tx || !tx.meta) {
          continue;
        }

        const logs = tx.meta.logMessages || [];

        for (const log of logs) {
          if (typeof log !== 'string' || !log.startsWith('Program data:')) {
            continue;
          }

          try {
            const encoded = log.substring('Program data: '.length).trim();
            const buffer = Buffer.from(encoded, 'base64');
            const discriminator = buffer.subarray(0, 8).toString('hex');

            await programEventProcessorService.processEvent({
              programId,
              eventType: discriminator,
              txSignature: sig.signature,
              slot: sig.slot,
              payload: { rawPayload: buffer.toString('base64') },
            });
          } catch (err) {
            logger.warn({ err, signature: sig.signature }, 'Failed to process replayed event');
          }
        }

        lastSlot = sig.slot;
        processedCount++;

        if (processedCount >= maxSlots) {
          break;
        }
      }

      before = signatures[signatures.length - 1].signature;

      if (signatures.length < DEFAULT_BATCH_SIZE) {
        break;
      }
    }
  } catch (err) {
    logger.error({ err, programKey }, 'Indexer recovery failed');
    return { recovered: false, reason: 'ERROR', error: err.message, processedCount, lastSlot };
  }

  if (lastSlot > (checkpoint.lastProcessedSlot || 0)) {
    await indexerCheckpointService.saveCheckpoint({
      programId,
      lastProcessedSlot: lastSlot,
    });
  }

  logger.info({ programKey, processedCount, lastSlot }, 'Indexer recovery complete');

  return {
    recovered: true,
    processedCount,
    lastSlot,
    fromSlot: checkpoint.lastProcessedSlot || 0,
  };
}

export async function recoverAll({ maxSlotsPerProgram = MAX_SLOTS_PER_RECOVERY } = {}) {
  const programs = programConfigService.getPrograms();

  const results = [];

  for (const [key, programId] of Object.entries(programs)) {
    if (!programId) {
      results.push({ programKey: key, recovered: false, reason: 'NOT_CONFIGURED' });
      continue;
    }

    try {
      const result = await recoverFromCheckpoint({ programKey: key, maxSlots: maxSlotsPerProgram });
      results.push({ programKey: key, ...result });
    } catch (err) {
      logger.warn({ err, programKey: key }, 'Recovery failed for program');
      results.push({ programKey: key, recovered: false, error: err.message });
    }
  }

  return { programs: results };
}

export const indexerRecoveryService = {
  recoverFromCheckpoint,
  recoverAll,
  MAX_SLOTS_PER_RECOVERY,
};