/**
 * Connection Service
 *
 * Provides a cached Solana RPC connection and health information.
 * The concrete library (@solana/web3.js) is loaded lazily so that
 * the platform can boot without it installed in non-Solana
 * environments.
 *
 * @module server/modules/solana/config/connection.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { getRpcUrl, getNetworkInfo } from './network.service';

let cachedConnection = null;
let cachedConnectionRpcUrl = null;

async function loadWeb3() {
  try {
    const module = await import('@solana/web3.js');
    if (!module || !module.Connection) {
      throw new Error('Connection export missing');
    }
    return module;
  } catch (err) {
    logger.warn({ err }, 'Solana web3 library is not installed');
    throw new AppError(
      'Solana web3 library is not available',
      ERROR_CODES.CONFIGURATION_MISSING,
      500,
    );
  }
}

export async function getConnection() {
  const rpcUrl = getRpcUrl();

  if (cachedConnection && cachedConnectionRpcUrl === rpcUrl) {
    return cachedConnection;
  }

  const web3 = await loadWeb3();

  cachedConnection = new web3.Connection(rpcUrl, 'confirmed');
  cachedConnectionRpcUrl = rpcUrl;

  logger.info({ rpcUrl }, 'Solana connection created');

  return cachedConnection;
}

export async function checkConnectionHealth() {
  const info = getNetworkInfo();

  try {
    const connection = await getConnection();

    const start = Date.now();
    const slot = await connection.getSlot();
    const latencyMs = Date.now() - start;

    return {
      healthy: true,
      network: info.network,
      rpcUrl: info.rpcUrl,
      slot,
      latencyMs,
    };
  } catch (err) {
    logger.warn({ err }, 'Solana connection health check failed');
    return {
      healthy: false,
      network: info.network,
      rpcUrl: info.rpcUrl,
      error: err.message,
    };
  }
}

export async function getCurrentSlot() {
  const connection = await getConnection();
  return connection.getSlot();
}

export async function getLatestBlockhash() {
  const connection = await getConnection();
  const response = await connection.getLatestBlockhash('confirmed');
  return {
    blockhash: response.blockhash,
    lastValidBlockHeight: response.lastValidBlockHeight,
  };
}

export async function getBalance({ walletAddress }) {
  if (!walletAddress) {
    throw new AppError('walletAddress is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const connection = await getConnection();
  const lamports = await connection.getBalance(new (await loadWeb3()).PublicKey(walletAddress));

  return {
    walletAddress,
    lamports,
    sol: lamports / 1_000_000_000,
  };
}

export async function getTransaction({ txSignature }) {
  if (!txSignature) {
    throw new AppError('txSignature is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const connection = await getConnection();
  const tx = await connection.getTransaction(txSignature, {
    commitment: 'confirmed',
    maxSupportedTransactionVersion: 0,
  });

  return tx;
}

export function resetConnection() {
  cachedConnection = null;
  cachedConnectionRpcUrl = null;
}

export const connectionService = {
  getConnection,
  checkConnectionHealth,
  getCurrentSlot,
  getLatestBlockhash,
  getBalance,
  getTransaction,
  resetConnection,
};