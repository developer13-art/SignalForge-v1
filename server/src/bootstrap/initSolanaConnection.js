'use strict';

const { Connection } = require('@solana/web3.js');

const solanaConfig = require('../modules/solana/config/connection.service');

/**
 * SignalForge - Initialize Solana Connection
 *
 * Creates the shared Solana RPC connection used by Solana Actions,
 * Proof of Alpha, and the DEX gateways. The connection is attached to
 * `app.locals.solanaConnection` so that any module can reuse it.
 */
async function initSolanaConnection() {
  const endpoint = solanaConfig.resolveRpcUrl();
  const commitment = solanaConfig.resolveCommitment();

  const connection = new Connection(endpoint, commitment);

  global.__signalforgeSolanaConnection = connection;

  return {
    endpoint,
    commitment,
    connectedAt: new Date().toISOString(),
  };
}

module.exports = initSolanaConnection;
module.exports.initSolanaConnection = initSolanaConnection;