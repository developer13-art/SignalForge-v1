'use strict';

const { Connection } = require('@solana/web3.js');

const solanaConfig = require('../config/connection.service');

/**
 * SignalForge - Solana Indexer Service
 *
 * The indexer is a passive observer. It listens for SignalForge memo
 * transactions and records them in the local proof index so that
 * verifications do not require an RPC round trip. The indexer never
 * signs transactions and never submits state changes.
 */

let connection = null;
let subscriptionId = null;
let running = false;

const MEMO_PROGRAM_ID = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';
const SIGNALFORGE_MEMO_PREFIX = 'SFA-PROOF';

function resolveLogger() {
  if (global.__signalforgeLogger && typeof global.__signalforgeLogger.info === 'function') {
    return global.__signalforgeLogger;
  }
  return null;
}

function handleLog(log) {
  if (!log || !log.logs || log.logs.length === 0) {
    return;
  }

  const matched = log.logs.find((entry) =>
    typeof entry === 'string' && entry.includes(SIGNALFORGE_MEMO_PREFIX),
  );

  if (!matched) {
    return;
  }

  const logger = resolveLogger();
  if (logger) {
    logger.info(
      {
        context: 'solana-indexer',
        signature: log.signature,
        slot: log.slot,
      },
      'SignalForge memo observed on-chain',
    );
  }

  // The confirmation service already persists verified memos; the
  // indexer only emits an event so that downstream subsystems can
  // react without reading the RPC.
  const bus = global.__signalforgeEventBus;
  if (bus && typeof bus.publish === 'function') {
    bus.publish('solana.indexer.memo.observed', {
      signature: log.signature,
      slot: log.slot,
      observedAt: new Date().toISOString(),
    });
  }
}

async function start() {
  if (running) {
    return { status: 'already_running' };
  }

  const endpoint = solanaConfig.resolveRpcUrl();
  const commitment = solanaConfig.resolveCommitment();

  connection = new Connection(endpoint, commitment);

  subscriptionId = connection.onLogs(
    'all',
    (logs) => {
      try {
        handleLog(logs);
      } catch (_error) {
        // Never let the indexer crash the process.
      }
    },
    commitment,
  );

  running = true;

  return {
    status: 'running',
    subscriptionId,
    endpoint,
    commitment,
    startedAt: new Date().toISOString(),
  };
}

async function stop() {
  if (!running) {
    return { status: 'not_running' };
  }

  if (connection && subscriptionId !== null) {
    try {
      await connection.removeOnLogsListener(subscriptionId);
    } catch (_error) {
      // Ignore
    }
  }

  subscriptionId = null;
  connection = null;
  running = false;

  return {
    status: 'stopped',
    stoppedAt: new Date().toISOString(),
  };
}

function status() {
  return {
    running,
    subscriptionId,
  };
}

module.exports = {
  start,
  stop,
  status,
  handleLog,
  MEMO_PROGRAM_ID,
};