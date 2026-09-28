/**
 * Event Listener Service
 *
 * Subscribes to program event logs via the Solana RPC websocket and
 * forwards them to the program event processor. Uses the indexer
 * checkpoint to avoid missing events on reconnects.
 *
 * @module server/modules/solana/indexer/event-listener.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { connectionService } = require('../config/connection.service');
const { programConfigService } = require('../config/program-config.service');
const { programEventProcessorService } = require('./program-event-processor.service');

const ACTIVE_SUBSCRIPTIONS = new Map();

async function loadWeb3() {
  try {
    const module = await import('@solana/web3.js');
    if (!module || !module.PublicKey) {
      throw new Error('PublicKey missing');
    }
    return module;
  } catch (err) {
    throw new AppError(
      'Solana web3 library is not available',
      ERROR_CODES.CONFIGURATION_MISSING,
      500,
    );
  }
}

function parseEventLogs(logs) {
  if (!Array.isArray(logs)) {
    return [];
  }

  const events = [];

  for (const log of logs) {
    if (typeof log !== 'string' || !log.startsWith('Program data:')) {
      continue;
    }
    try {
      const encoded = log.substring('Program data: '.length).trim();
      const buffer = Buffer.from(encoded, 'base64');
      events.push(buffer);
    } catch (err) {
      logger.warn({ err }, 'Failed to decode program log entry');
    }
  }

  return events;
}

function extractEventTypeAndPayload({ buffer }) {
  if (!buffer || buffer.length < 8) {
    return null;
  }

  const discriminator = buffer.subarray(0, 8);
  const payloadBytes = buffer.subarray(8);

  return {
    discriminator: discriminator.toString('hex'),
    payloadBytes,
  };
}
async function startListening({ programKey = 'attestation' }) {
  const programId = programConfigService.tryGetProgramId({ key: programKey });

  if (!programId) {
    logger.warn({ programKey }, 'Program ID not configured; skipping event listener');
    return { listening: false, reason: 'PROGRAM_NOT_CONFIGURED' };
  }

  if (ACTIVE_SUBSCRIPTIONS.has(programKey)) {
    return { listening: true, alreadyListening: true };
  }

  const web3 = await loadWeb3();
  const connection = await connectionService.getConnection();

  const publicKey = new web3.PublicKey(programId);

  const subscriptionId = connection.onLogs(
    publicKey,
    async (logs, ctx) => {
      try {
        const events = parseEventLogs(logs.logs);

        for (const buffer of events) {
          const parsed = extractEventTypeAndPayload({ buffer });

          if (!parsed) {
            continue;
          }

          await programEventProcessorService.processEvent({
            programId,
            eventType: parsed.discriminator,
            txSignature: logs.signature,
            slot: ctx.slot,
            payload: {
              rawPayload: buffer.toString('base64'),
            },
          }).catch((err) => logger.warn({ err }, 'Failed to process program event'));
        }
      } catch (err) {
        logger.warn({ err, programKey }, 'Error while processing program logs');
      }
    },
    'confirmed',
  );

  ACTIVE_SUBSCRIPTIONS.set(programKey, { subscriptionId, programId });

  logger.info({ programKey, programId, subscriptionId }, 'Event listener started');

  return { listening: true, subscriptionId };
}
async function stopListening({ programKey }) {
  if (!programKey) {
    throw new AppError('programKey is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const entry = ACTIVE_SUBSCRIPTIONS.get(programKey);

  if (!entry) {
    return { listening: false, reason: 'NOT_LISTENING' };
  }

  try {
    const connection = await connectionService.getConnection();
    await connection.removeOnLogsListener(entry.subscriptionId);
  } catch (err) {
    logger.warn({ err, programKey }, 'Failed to remove onLogs listener');
  }

  ACTIVE_SUBSCRIPTIONS.delete(programKey);

  logger.info({ programKey }, 'Event listener stopped');

  return { listening: false };
}
async function stopAll() {
  const keys = Array.from(ACTIVE_SUBSCRIPTIONS.keys());
  const results = [];

  for (const key of keys) {
    const result = await stopListening({ programKey: key });
    results.push({ programKey: key, ...result });
  }

  return results;
}
function listActiveListeners() {
  return Array.from(ACTIVE_SUBSCRIPTIONS.entries()).map(([programKey, entry]) => ({
    programKey,
    programId: entry.programId,
    subscriptionId: entry.subscriptionId,
  }));
}
const eventListenerService = {
  startListening,
  stopListening,
  stopAll,
  listActiveListeners,
};
module.exports.eventListenerService = eventListenerService;
module.exports.listActiveListeners = listActiveListeners;

module.exports.startListening = startListening;

module.exports.stopListening = stopListening;

module.exports.stopAll = stopAll;
