'use strict';

/**
 * SignalForge - Frontend Solana Configuration
 *
 * Everything the frontend needs to talk to the Solana network and to
 * SignalForge's on-chain features. Kept in one place so the network
 * can be switched without editing feature code.
 */

function resolveEnv(name, fallback) {
  if (typeof import.meta === 'undefined' || !import.meta.env) {
    return fallback;
  }
  const value = import.meta.env[name];
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return value;
}

const SOLANA_NETWORK = resolveEnv('VITE_SOLANA_NETWORK', 'mainnet-beta');

const SOLANA_CLUSTERS = Object.freeze({
  'mainnet-beta': {
    network: 'mainnet-beta',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    wsUrl: 'wss://api.mainnet-beta.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    clusterQuery: '',
  },
  devnet: {
    network: 'devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    wsUrl: 'wss://api.devnet.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    clusterQuery: '?cluster=devnet',
  },
  testnet: {
    network: 'testnet',
    rpcUrl: 'https://api.testnet.solana.com',
    wsUrl: 'wss://api.testnet.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    clusterQuery: '?cluster=testnet',
  },
});

const cluster = SOLANA_CLUSTERS[SOLANA_NETWORK] || SOLANA_CLUSTERS['mainnet-beta'];

const SOLANA_CONFIG = Object.freeze({
  ...cluster,
  commitment: resolveEnv('VITE_SOLANA_COMMITMENT', 'confirmed'),
  memoProgramId: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
  tokenProgramId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  token2022ProgramId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
  associatedTokenProgramId: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',

  explorer: {
    txUrl: (signature) => `${cluster.explorerUrl}/tx/${signature}${cluster.clusterQuery}`,
    addressUrl: (address) => `${cluster.explorerUrl}/address/${address}${cluster.clusterQuery}`,
  },
});

export default SOLANA_CONFIG;
export { SOLANA_CONFIG, SOLANA_CLUSTERS };