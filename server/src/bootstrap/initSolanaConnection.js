/**
 * Solana Connection Initialization
 *
 * Initializes the Solana RPC connection used by the attestation,
 * provenance, and payment modules. Loads the treasury keypair when
 * configured.
 *
 * @module signalforge/server/bootstrap/initSolanaConnection
 */

import fs from 'node:fs';

import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
} from '@solana/web3.js';

import solanaConfig from '../config/solana.config.js';
import { getLogger } from './initLogger.js';

let solanaState = null;

function loadTreasuryKeypair() {
  const path = solanaConfig.treasury.adminKeypairPath;
  if (!path) {
    return null;
  }
  try {
    const raw = fs.readFileSync(path, 'utf8');
    const arr = JSON.parse(raw);
    return Keypair.fromSecretKey(Uint8Array.from(arr));
  } catch (error) {
    throw new Error(`Failed to load Solana admin keypair: ${error.message}`);
  }
}

function resolveRpcUrl() {
  if (solanaConfig.rpcUrl) {
    return solanaConfig.rpcUrl;
  }
  return clusterApiUrl(solanaConfig.network);
}

export async function initSolanaConnection() {
  const logger = getLogger('solana');

  if (!solanaConfig.enabled) {
    logger.info('Solana disabled by configuration');
    return { enabled: false, close: async () => {} };
  }

  if (solanaState) {
    logger.warn('Solana connection already initialized');
    return solanaState;
  }

  const rpcUrl = resolveRpcUrl();
  const connection = new Connection(rpcUrl, {
    commitment: solanaConfig.commitment,
    wsEndpoint: solanaConfig.wsUrl || undefined,
  });

  let treasuryKeypair = null;
  try {
    treasuryKeypair = loadTreasuryKeypair();
  } catch (error) {
    logger.warn({ err: error }, 'Treasury keypair not loaded');
  }

  const programIds = {
    attestation: solanaConfig.programs.attestation
      ? new PublicKey(solanaConfig.programs.attestation)
      : null,
    provenance: solanaConfig.programs.provenance
      ? new PublicKey(solanaConfig.programs.provenance)
      : null,
    payment: solanaConfig.programs.payment
      ? new PublicKey(solanaConfig.programs.payment)
      : null,
  };

  const treasuryWallet = solanaConfig.treasury.wallet
    ? new PublicKey(solanaConfig.treasury.wallet)
    : treasuryKeypair
      ? treasuryKeypair.publicKey
      : null;

  try {
    const version = await connection.getVersion();
    logger.info({ rpcUrl, version }, 'Connected to Solana cluster');
  } catch (error) {
    logger.error({ err: error, rpcUrl }, 'Failed to contact Solana cluster');
    throw error;
  }

  async function close() {
    solanaState = null;
  }

  solanaState = {
    enabled: true,
    connection,
    treasuryKeypair,
    treasuryWallet,
    programIds,
    network: solanaConfig.network,
    rpcUrl,
    close,

    async getBalance(publicKey) {
      return connection.getBalance(publicKey);
    },

    async getSlot() {
      return connection.getSlot();
    },

    async getLatestBlockhash() {
      return connection.getLatestBlockhash();
    },
  };

  return solanaState;
}

export function getSolanaConnection() {
  if (!solanaState) {
    throw new Error('Solana connection has not been initialized');
  }
  return solanaState;
}

export default initSolanaConnection;