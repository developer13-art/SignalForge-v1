'use strict';

const solanaConfig = require('../modules/solana/config/connection.service');

/**
 * SignalForge - Initialize Solana Indexer
 *
 * Boots the Solana event indexer used by the Proof of Alpha subsystem
 * to keep its local proof index fresh. The indexer is passive: it
 * listens to its own program events and to transaction logs that
 * match known reference patterns.
 */
async function initSolanaIndexer() {
  const enabled = solanaConfig.isIndexerEnabled();
  if (!enabled) {
    return { status: 'disabled' };
  }

  const indexer = require('../modules/solana/indexer/indexer.service');
  await indexer.start();

  global.__signalforgeSolanaIndexer = indexer;

  return {
    status: 'running',
    startedAt: new Date().toISOString(),
  };
}

module.exports = initSolanaIndexer;