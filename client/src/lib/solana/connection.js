/**
 * Solana Connection
 *
 * Lazily constructs and caches a Solana RPC connection for the client.
 *
 * @module client/src/lib/solana/connection
 */

import { Connection, clusterApiUrl } from '@solana/web3.js';
import { solanaConfig } from '../../config/solana.config.js';

let connectionInstance = null;

export function getConnection() {
  if (connectionInstance) {
    return connectionInstance;
  }

  const endpoint = solanaConfig.rpcUrl || clusterApiUrl(solanaConfig.network);

  connectionInstance = new Connection(endpoint, solanaConfig.commitment);

  return connectionInstance;
}

export function resetConnection() {
  connectionInstance = null;
}

export async function getCurrentSlot() {
  const connection = getConnection();
  return connection.getSlot();
}

export async function getBalance(publicKey) {
  if (!publicKey) {
    throw new Error('publicKey is required');
  }
  const connection = getConnection();
  return connection.getBalance(publicKey);
}

export const solanaConnection = {
  getConnection,
  resetConnection,
  getCurrentSlot,
  getBalance,
};

export default solanaConnection;