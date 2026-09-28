/**
 * Solana Tokens
 *
 * Defines the Solana tokens accepted by SignalForge for payment.
 *
 * @module @signalforge/shared/constants/solana-tokens
 */const SOLANA_TOKENS = Object.freeze({
  SOL: 'SOL',
  USDC: 'USDC',
  USDT: 'USDT',
});const SOLANA_TOKEN_VALUES = Object.freeze(Object.values(SOLANA_TOKENS));const SOLANA_TOKEN_LABELS = Object.freeze({
  [SOLANA_TOKENS.SOL]: 'Solana (SOL)',
  [SOLANA_TOKENS.USDC]: 'USD Coin (USDC on Solana)',
  [SOLANA_TOKENS.USDT]: 'Tether USD (USDT on Solana)',
});const SOLANA_TOKEN_DECIMALS = Object.freeze({
  [SOLANA_TOKENS.SOL]: 9,
  [SOLANA_TOKENS.USDC]: 6,
  [SOLANA_TOKENS.USDT]: 6,
});const SOLANA_MAINNET_TOKEN_MINTS = Object.freeze({
  [SOLANA_TOKENS.USDC]: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  [SOLANA_TOKENS.USDT]: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
});const SOLANA_DEVNET_TOKEN_MINTS = Object.freeze({
  [SOLANA_TOKENS.USDC]: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  [SOLANA_TOKENS.USDT]: 'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS',
});function isValidSolanaToken(token) {
  return SOLANA_TOKEN_VALUES.includes(token);
}function getTokenDecimals(token) {
  return SOLANA_TOKEN_DECIMALS[token];
}

module.exports.isValidSolanaToken = isValidSolanaToken;
module.exports.getTokenDecimals = getTokenDecimals;
module.exports.SOLANA_TOKENS = SOLANA_TOKENS;
module.exports.SOLANA_TOKEN_VALUES = SOLANA_TOKEN_VALUES;
module.exports.SOLANA_TOKEN_LABELS = SOLANA_TOKEN_LABELS;
module.exports.SOLANA_TOKEN_DECIMALS = SOLANA_TOKEN_DECIMALS;
module.exports.SOLANA_MAINNET_TOKEN_MINTS = SOLANA_MAINNET_TOKEN_MINTS;
module.exports.SOLANA_DEVNET_TOKEN_MINTS = SOLANA_DEVNET_TOKEN_MINTS;
