/**
 * Solana Configuration
 *
 * Client-side Solana network and program configuration. Values come
 * from Vite environment variables so devnet and mainnet deployments
 * can be swapped without a rebuild.
 *
 * @module client/src/config/solana.config
 */

const network = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';

const DEFAULT_RPC = {
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
  localnet: 'http://localhost:8899',
};

const DEFAULT_WS = {
  'mainnet-beta': 'wss://api.mainnet-beta.solana.com',
  devnet: 'wss://api.devnet.solana.com',
  testnet: 'wss://api.testnet.solana.com',
  localnet: 'ws://localhost:8900',
};

export const solanaConfig = Object.freeze({
  network,
  rpcUrl: import.meta.env.VITE_SOLANA_RPC_URL || DEFAULT_RPC[network] || DEFAULT_RPC.devnet,
  wsUrl: import.meta.env.VITE_SOLANA_WS_URL || DEFAULT_WS[network] || DEFAULT_WS.devnet,
  commitment: 'confirmed',
  programs: {
    attestation: import.meta.env.VITE_SOLANA_ATTESTATION_PROGRAM_ID || null,
    provenance: import.meta.env.VITE_SOLANA_PROVENANCE_PROGRAM_ID || null,
    payment: import.meta.env.VITE_SOLANA_PAYMENT_PROGRAM_ID || null,
  },
  tokens: {
    SOL: { symbol: 'SOL', decimals: 9 },
    USDC: {
      symbol: 'USDC',
      decimals: 6,
      mainnetMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      devnetMint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    },
    USDT: {
      symbol: 'USDT',
      decimals: 6,
      mainnetMint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      devnetMint: 'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS',
    },
  },
  walletStorageKey: 'signalforge.solana.wallet',
});

export default solanaConfig;