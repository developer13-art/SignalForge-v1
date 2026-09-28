'use strict';

/**
 * SignalForge - Frontend API Configuration
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

const API_CONFIG = Object.freeze({
  baseUrl: resolveEnv('VITE_API_URL', 'http://localhost:4000'),
  version: resolveEnv('VITE_API_VERSION', 'v1'),
  timeoutMs: Number(resolveEnv('VITE_API_TIMEOUT_MS', 30000)),
  retryAttempts: Number(resolveEnv('VITE_API_RETRY_ATTEMPTS', 2)),
  retryBackoffMs: 500,

  // Feature flags relevant to API behavior.
  useSolanaActions: resolveEnv('VITE_FEATURE_SOLANA_ACTIONS', 'true') === 'true',
  useProofOfAlpha: resolveEnv('VITE_FEATURE_PROOF_OF_ALPHA', 'true') === 'true',
  useCryptoTrading: resolveEnv('VITE_FEATURE_CRYPTO_TRADING', 'true') === 'true',

  // Solana network used by the client for explorer links and wallet
  // adapters. Must match the backend's configured network for the
  // verification links to resolve correctly.
  solanaNetwork: resolveEnv('VITE_SOLANA_NETWORK', 'mainnet-beta'),

  // Polling intervals for on-chain data.
  polling: {
    positionsMs: Number(resolveEnv('VITE_POLL_POSITIONS_MS', 15000)),
    ordersMs: Number(resolveEnv('VITE_POLL_ORDERS_MS', 15000)),
    marketDataMs: Number(resolveEnv('VITE_POLL_MARKET_DATA_MS', 30000)),
    leaderboardMs: Number(resolveEnv('VITE_POLL_LEADERBOARD_MS', 60000)),
  },
});

export default API_CONFIG;
export { API_CONFIG };