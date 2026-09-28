/**
 * SOL Payment Service
 *
 * Handles native SOL transfers. Validates amounts in SOL, derives
 * lamports, and works with the transaction builder to construct the
 * transfer instruction.
 *
 * @module server/modules/solana/payments/sol-payment.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { LAMPORTS_PER_SOL } = require('@signalforge/shared/constants/solana-tokens');

const MIN_SOL_AMOUNT = 0.000001;
const MAX_SOL_AMOUNT = 1000;
function validateSolAmount({ amount }) {
  const numeric = Number(amount);

  if (!Number.isFinite(numeric) || numeric < MIN_SOL_AMOUNT || numeric > MAX_SOL_AMOUNT) {
    throw new AppError(
      `SOL amount must be between ${MIN_SOL_AMOUNT} and ${MAX_SOL_AMOUNT}`,
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  return numeric;
}
function solToLamports({ amount }) {
  const numeric = validateSolAmount({ amount });
  return Math.round(numeric * LAMPORTS_PER_SOL);
}
function lamportsToSol({ lamports }) {
  const numeric = Number(lamports);
  if (!Number.isFinite(numeric)) {
    throw new AppError('lamports must be a number', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return numeric / LAMPORTS_PER_SOL;
}
function buildSolTransferRequest({ amount, recipientWallet, senderWallet }) {
  if (!recipientWallet) {
    throw new AppError('recipientWallet is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const lamports = solToLamports({ amount });

  return {
    type: 'SOL_TRANSFER',
    token: 'SOL',
    amount: validateSolAmount({ amount }),
    lamports,
    recipientWallet,
    senderWallet: senderWallet || null,
  };
}
function estimateSolFee({ lamports }) {
  const baseFeeLamports = 5000;
  const priorityFeeLamports = 0;
  const totalLamports = baseFeeLamports + priorityFeeLamports;

  return {
    baseFeeLamports,
    priorityFeeLamports,
    totalLamports,
    totalSol: lamportsToSol({ lamports: totalLamports }),
  };
}
const solPaymentService = {
  validateSolAmount,
  solToLamports,
  lamportsToSol,
  buildSolTransferRequest,
  estimateSolFee,
  MIN_SOL_AMOUNT,
  MAX_SOL_AMOUNT,
};
module.exports.solPaymentService = solPaymentService;
module.exports.validateSolAmount = validateSolAmount;
module.exports.solToLamports = solToLamports;
module.exports.lamportsToSol = lamportsToSol;
module.exports.buildSolTransferRequest = buildSolTransferRequest;
module.exports.estimateSolFee = estimateSolFee;
