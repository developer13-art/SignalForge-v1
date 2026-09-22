/**
 * Solana Tokens
 *
 * Defines the Solana tokens accepted by SignalForge for payment.
 *
 * @module @signalforge/shared/constants/solana-tokens
 */

export const SOLANA_TOKENS = Object.freeze({
  SOL: 'SOL',
  USDC: 'USDC',
  USDT: 'USDT',
});

export const SOLANA_TOKEN_VALUES = Object.freeze(Object.values(SOLANA_TOKENS));

export const SOLANA_TOKEN_LABELS = Object.freeze({
  [SOLANA_TOKENS.SOL]: 'Solana (SOL)',
  [SOLANA_TOKENS.USDC]: 'USD Coin (USDC on Solana)',
  [SOLANA_TOKENS.USDT]: 'Tether USD (USDT on Solana)',
});

export const SOLANA_TOKEN_DECIMALS = Object.freeze({
  [SOLANA_TOKENS.SOL]: 9,
  [SOLANA_TOKENS.USDC]: 6,
  [SOLANA_TOKENS.USDT]: 6,
});

export const SOLANA_MAINNET_TOKEN_MINTS = Object.freeze({
  [SOLANA_TOKENS.USDC]: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  [SOLANA_TOKENS.USDT]: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
});

export const SOLANA_DEVNET_TOKEN_MINTS = Object.freeze({
  [SOLANA_TOKENS.USDC]: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  [SOLANA_TOKENS.USDT]: 'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS',
});

export function isValidSolanaToken(token) {
  return SOLANA_TOKEN_VALUES.includes(token);
}

export function getTokenDecimals(token) {
  return SOLANA_TOKEN_DECIMALS[token];
}