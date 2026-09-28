/**
 * SOL Payment Service
 *
 * Handles native SOL transfers. Validates amounts in SOL, derives
 * lamports, and works with the transaction builder to construct the
 * transfer instruction.
 *
 * @module server/modules/solana/payments/sol-payment.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { LAMPORTS_PER_SOL } from '@signalforge/shared/constants/solana-tokens';

const MIN_SOL_AMOUNT = 0.000001;
const MAX_SOL_AMOUNT = 1000;

export function validateSolAmount({ amount }) {
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

export function solToLamports({ amount }) {
  const numeric = validateSolAmount({ amount });
  return Math.round(numeric * LAMPORTS_PER_SOL);
}

export function lamportsToSol({ lamports }) {
  const numeric = Number(lamports);
  if (!Number.isFinite(numeric)) {
    throw new AppError('lamports must be a number', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return numeric / LAMPORTS_PER_SOL;
}

export function buildSolTransferRequest({ amount, recipientWallet, senderWallet }) {
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

export function estimateSolFee({ lamports }) {
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

export const solPaymentService = {
  validateSolAmount,
  solToLamports,
  lamportsToSol,
  buildSolTransferRequest,
  estimateSolFee,
  MIN_SOL_AMOUNT,
  MAX_SOL_AMOUNT,
};