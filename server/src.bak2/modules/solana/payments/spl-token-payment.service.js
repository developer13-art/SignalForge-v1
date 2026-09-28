/**
 * SPL Token Payment Service
 *
 * Handles SPL token transfers (USDC, USDT). Validates amounts against
 * token decimals, resolves the token mint for the current network,
 * and builds the transfer request.
 *
 * @module server/modules/solana/payments/spl-token-payment.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { SOLANA_TOKENS, SOLANA_TOKEN_VALUES } = require('../solana.constants');
const { networkService } = require('../config/network.service');

const TOKEN_DECIMALS = Object.freeze({
  [SOLANA_TOKENS.USDC]: 6,
  [SOLANA_TOKENS.USDT]: 6,
});

const TOKEN_MINTS = Object.freeze({
  'mainnet-beta': {
    [SOLANA_TOKENS.USDC]: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    [SOLANA_TOKENS.USDT]: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  },
  devnet: {
    [SOLANA_TOKENS.USDC]: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    [SOLANA_TOKENS.USDT]: 'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS',
  },
});

const MIN_TOKEN_AMOUNT = 0.01;
const MAX_TOKEN_AMOUNT = 1_000_000;
function getTokenDecimals({ token }) {
  if (!SOLANA_TOKEN_VALUES.includes(token)) {
    throw new AppError(`Unsupported token: ${token}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const decimals = TOKEN_DECIMALS[token];

  if (decimals === undefined) {
    throw new AppError(`Decimals for token ${token} not configured`, ERROR_CODES.CONFIGURATION_MISSING, 500);
  }

  return decimals;
}
function getTokenMint({ token }) {
  if (!SOLANA_TOKEN_VALUES.includes(token) || token === SOLANA_TOKENS.SOL) {
    throw new AppError(`Token ${token} does not have a mint`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const network = networkService.getCurrentNetwork();

  const mint = TOKEN_MINTS[network] && TOKEN_MINTS[network][token];

  if (!mint) {
    throw new AppError(
      `Token mint for ${token} not configured on network ${network}`,
      ERROR_CODES.CONFIGURATION_MISSING,
      500,
    );
  }

  return mint;
}
function validateTokenAmount({ token, amount }) {
  if (!SOLANA_TOKEN_VALUES.includes(token)) {
    throw new AppError(`Unsupported token: ${token}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const numeric = Number(amount);

  if (!Number.isFinite(numeric) || numeric < MIN_TOKEN_AMOUNT || numeric > MAX_TOKEN_AMOUNT) {
    throw new AppError(
      `Amount must be between ${MIN_TOKEN_AMOUNT} and ${MAX_TOKEN_AMOUNT}`,
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  return numeric;
}
function toAtomicUnits({ token, amount }) {
  const decimals = getTokenDecimals({ token });
  const numeric = validateTokenAmount({ token, amount });

  const factor = Math.pow(10, decimals);

  return Math.round(numeric * factor);
}
function fromAtomicUnits({ token, atomicAmount }) {
  const decimals = getTokenDecimals({ token });
  const numeric = Number(atomicAmount);

  if (!Number.isFinite(numeric) || numeric < 0) {
    throw new AppError('atomicAmount must be a non-negative number', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const factor = Math.pow(10, decimals);

  return numeric / factor;
}
function buildSplTokenTransferRequest({ token, amount, recipientWallet, senderWallet }) {
  if (!token || token === SOLANA_TOKENS.SOL) {
    throw new AppError('SPL token required for this transfer', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!recipientWallet) {
    throw new AppError('recipientWallet is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const mint = getTokenMint({ token });
  const atomicAmount = toAtomicUnits({ token, amount });

  return {
    type: 'SPL_TOKEN_TRANSFER',
    token,
    mint,
    amount: validateTokenAmount({ token, amount }),
    atomicAmount,
    decimals: getTokenDecimals({ token }),
    recipientWallet,
    senderWallet: senderWallet || null,
  };
}
function estimateSplTokenFee() {
  return {
    baseFeeLamports: 5000,
    ataRentLamports: 2039280,
    note: 'An associated token account may need to be created if it does not already exist.',
  };
}
const splTokenPaymentService = {
  getTokenDecimals,
  getTokenMint,
  validateTokenAmount,
  toAtomicUnits,
  fromAtomicUnits,
  buildSplTokenTransferRequest,
  estimateSplTokenFee,
  TOKEN_DECIMALS,
  MIN_TOKEN_AMOUNT,
  MAX_TOKEN_AMOUNT,
};
module.exports.splTokenPaymentService = splTokenPaymentService;
module.exports.getTokenDecimals = getTokenDecimals;
module.exports.getTokenMint = getTokenMint;
module.exports.validateTokenAmount = validateTokenAmount;
module.exports.toAtomicUnits = toAtomicUnits;
module.exports.fromAtomicUnits = fromAtomicUnits;
module.exports.buildSplTokenTransferRequest = buildSplTokenTransferRequest;
module.exports.estimateSplTokenFee = estimateSplTokenFee;
