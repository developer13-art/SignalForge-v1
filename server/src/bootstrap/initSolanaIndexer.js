/**
 * Solana Indexer Initialization
 *
 * Initializes the Solana indexer that watches program logs and
 * transaction confirmations, updating PostgreSQL with confirmed
 * attestations, provenance anchors, and payments.
 *
 * @module signalforge/server/bootstrap/initSolanaIndexer
 */

import { getLogger } from './initLogger.js';
import solanaConfig from '../config/solana.config.js';

let indexerState = null;

export async function initSolanaIndexer(dependencies = {}) {
  const logger = getLogger('solana-indexer');

  if (!solanaConfig.enabled || !solanaConfig.indexer.enabled) {
    logger.info('Solana indexer disabled by configuration');
    return { enabled: false, close: async () => {} };
  }

  if (indexerState) {
    logger.warn('Solana indexer already initialized');
    return indexerState;
  }

  const db = dependencies.db;
  const solana = dependencies.solana;
  if (!db || !solana) {
    throw new Error('initSolanaIndexer requires database and solana dependencies');
  }

  const pollIntervalMs = solanaConfig.indexer.pollIntervalMs;
  const batchSize = solanaConfig.indexer.batchSize;
  const checkpoints = new Map();

  let intervalHandle = null;
  let processing = false;
  let stopping = false;

  const subscriptions = new Map();

  async function getCheckpoint(programId) {
    if (checkpoints.has(programId)) {
      return checkpoints.get(programId);
    }
    const result = await db.query(
      `SELECT last_signature, last_slot FROM solana_indexer_checkpoints WHERE program_id = $1`,
      [programId],
    );
    const checkpoint = result.rows[0] || { last_signature: null, last_slot: 0 };
    checkpoints.set(programId, checkpoint);
    return checkpoint;
  }

  async function updateCheckpoint(programId, signature, slot) {
    await db.query(
      `
        INSERT INTO solana_indexer_checkpoints (program_id, network, last_signature, last_slot, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (program_id) DO UPDATE
        SET last_signature = EXCLUDED.last_signature,
            last_slot = EXCLUDED.last_slot,
            updated_at = NOW()
      `,
      [programId, solana.network, signature, slot],
    );
    checkpoints.set(programId, { last_signature: signature, last_slot: slot });
  }

  async function fetchSignatures(programId, until) {
    const options = { limit: batchSize };
    if (until) {
      options.until = until;
    }
    return solana.connection.getSignaturesForAddress(
      new (programId.constructor)(programId),
      options,
      'confirmed',
    );
  }

  async function processSignature(programId, signatureInfo) {
    const tx = await solana.connection.getParsedTransaction(
      signatureInfo.signature,
      { commitment: 'confirmed', maxSupportedTransactionVersion: 0 },
    );
    if (!tx) {
      return;
    }
    const programLogs = (tx.meta?.logMessages || []).filter((line) =>
      line.includes('Program log:'),
    );
    for (const log of programLogs) {
      if (!log.includes('SignalForge::')) {
        continue;
      }
      try {
        const payload = JSON.parse(log.substring(log.indexOf('SignalForge::') + 13));
        await db.query(
          `INSERT INTO solana_events (signature, slot, program_id, event_type, payload, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (signature, event_type) DO NOTHING`,
          [
            signatureInfo.signature,
            signatureInfo.slot,
            programId,
            payload.eventType || 'UNKNOWN',
            payload,
          ],
        );
      } catch (parseErr) {
        logger.debug(
          { signature: signatureInfo.signature, err: parseErr },
          'Non-structured log line',
        );
      }
    }
  }

  async function tick() {
    if (processing || stopping) {
      return;
    }
    processing = true;

    try {
      const programIds = [
        solana.programIds.attestation,
        solana.programIds.provenance,
        solana.programIds.payment,
      ].filter(Boolean);

      for (const programId of programIds) {
        const checkpoint = await getCheckpoint(programId.toBase58());
        const signatures = await fetchSignatures(programId, checkpoint.last_signature);

        if (signatures.length === 0) {
          continue;
        }

        for (const info of signatures) {
          if (info.err) {
            continue;
          }
          try {
            await processSignature(programId, info);
          } catch (error) {
            logger.error(
              { signature: info.signature, err: error },
              'Failed to process signature',
            );
          }
        }

        const latest = signatures[0];
        await updateCheckpoint(programId.toBase58(), latest.signature, latest.slot);
      }
    } catch (error) {
      logger.error({ err: error }, 'Solana indexer tick failed');
    } finally {
      processing = false;
    }
  }

  intervalHandle = setInterval(tick, pollIntervalMs);
  if (intervalHandle.unref) {
    intervalHandle.unref();
  }

  setImmediate(() => {
    tick().catch((error) => {
      logger.error({ err: error }, 'Initial solana indexer tick failed');
    });
  });

  async function close() {
    stopping = true;
    if (intervalHandle) {
      clearInterval(intervalHandle);
      intervalHandle = null;
    }
    for (const unsubscribe of subscriptions.values()) {
      try {
        unsubscribe();
      } catch {
        // ignore
      }
    }
    subscriptions.clear();
    indexerState = null;
  }

  indexerState = {
    enabled: true,
    close,
    tick,
    async getCheckpoint(programId) {
      return getCheckpoint(programId);
    },
  };

  logger.info({ pollIntervalMs }, 'Solana indexer initialized');

  return indexerState;
}

export function getSolanaIndexer() {
  return indexerState;
}

export default initSolanaIndexer;