'use strict';

/**
 * SignalForge - Supported Token Constants
 *
 * Registry of Solana SPL tokens that Blink payments can use. The
 * client uses this to render the token picker; the server uses this
 * to resolve mints and decimals.
 */

const SUPPORTED_TOKEN_MINTS = Object.freeze({
  USDC_MAINNET: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDC_DEVNET: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  USDT_MAINNET: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  SOL_WRAPPED_MAINNET: 'So11111111111111111111111111111111111111112',
  SOL_WRAPPED_DEVNET: 'So11111111111111111111111111111111111111112',
  JUP_MAINNET: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  BONK_MAINNET: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  PYTH_MAINNET: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
  RAY_MAINNET: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  ORCA_MAINNET: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
});

const SUPPORTED_TOKEN_DECIMALS = Object.freeze({
  USDC: 6,
  USDT: 6,
  SOL: 9,
  JUP: 6,
  BONK: 5,
  PYTH: 6,
  RAY: 6,
  ORCA: 6,
});

const SUPPORTED_TOKENS = Object.freeze([
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    default: true,
    logo: '/assets/tokens/usdc.svg',
    mintByNetwork: {
      'mainnet-beta': SUPPORTED_TOKEN_MINTS.USDC_MAINNET,
      devnet: SUPPORTED_TOKEN_MINTS.USDC_DEVNET,
    },
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    default: false,
    logo: '/assets/tokens/usdt.svg',
    mintByNetwork: {
      'mainnet-beta': SUPPORTED_TOKEN_MINTS.USDT_MAINNET,
    },
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    default: false,
    logo: '/assets/tokens/sol.svg',
    mintByNetwork: {
      'mainnet-beta': SUPPORTED_TOKEN_MINTS.SOL_WRAPPED_MAINNET,
      devnet: SUPPORTED_TOKEN_MINTS.SOL_WRAPPED_DEVNET,
    },
  },
  {
    symbol: 'JUP',
    name: 'Jupiter',
    decimals: 6,
    default: false,
    logo: '/assets/tokens/jup.svg',
    mintByNetwork: {
      'mainnet-beta': SUPPORTED_TOKEN_MINTS.JUP_MAINNET,
    },
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    decimals: 5,
    default: false,
    logo: '/assets/tokens/bonk.svg',
    mintByNetwork: {
      'mainnet-beta': SUPPORTED_TOKEN_MINTS.BONK_MAINNET,
    },
  },
  {
    symbol: 'PYTH',
    name: 'Pyth Network',
    decimals: 6,
    default: false,
    logo: '/assets/tokens/pyth.svg',
    mintByNetwork: {
      'mainnet-beta': SUPPORTED_TOKEN_MINTS.PYTH_MAINNET,
    },
  },
  {
    symbol: 'RAY',
    name: 'Raydium',
    decimals: 6,
    default: false,
    logo: '/assets/tokens/ray.svg',
    mintByNetwork: {
      'mainnet-beta': SUPPORTED_TOKEN_MINTS.RAY_MAINNET,
    },
  },
  {
    symbol: 'ORCA',
    name: 'Orca',
    decimals: 6,
    default: false,
    logo: '/assets/tokens/orca.svg',
    mintByNetwork: {
      'mainnet-beta': SUPPORTED_TOKEN_MINTS.ORCA_MAINNET,
    },
  },
]);

function findTokenBySymbol(symbol) {
  if (!symbol) {
    return null;
  }
  const normalized = String(symbol).trim().toUpperCase();
  return SUPPORTED_TOKENS.find((token) => token.symbol === normalized) || null;
}

function resolveTokenMint(symbol, network = 'mainnet-beta') {
  const token = findTokenBySymbol(symbol);
  if (!token) {
    return null;
  }
  return token.mintByNetwork[network] || null;
}

function listTokenSymbols() {
  return SUPPORTED_TOKENS.map((token) => token.symbol);
}

module.exports = Object.freeze({
  SUPPORTED_TOKEN_MINTS,
  SUPPORTED_TOKEN_DECIMALS,
  SUPPORTED_TOKENS,
  findTokenBySymbol,
  resolveTokenMint,
  listTokenSymbols,
});