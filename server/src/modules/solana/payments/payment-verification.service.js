/**
 * Payment Verification Service
 *
 * Verifies that a Solana transaction actually moved the expected
 * funds to the expected recipient. Used during payment confirmation
 * to prevent fraudulent attestations.
 *
 * @module server/modules/solana/payments/payment-verification.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { connectionService } from '../config/connection.service';
import { solanaPaymentRepository } from './solana-payment.repository';
import { SOLANA_TOKENS } from '../solana.constants';

export async function verifyTransaction({
  paymentId,
  txSignature,
  expectedAmount,
  expectedToken,
  expectedRecipient,
}) {
  if (!txSignature) {
    throw new AppError('txSignature is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const connection = await connectionService.getConnection();

  let tx;
  try {
    tx = await connection.getTransaction(txSignature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });
  } catch (err) {
    logger.warn({ err, txSignature }, 'Failed to fetch Solana transaction');
    return { verified: false, reason: 'FETCH_FAILED' };
  }

  if (!tx) {
    return { verified: false, reason: 'TRANSACTION_NOT_FOUND' };
  }

  if (tx.meta && tx.meta.err) {
    return { verified: false, reason: 'TRANSACTION_ERRORED', error: tx.meta.err };
  }

  const preBalances = tx.meta ? tx.meta.preBalances : [];
  const postBalances = tx.meta ? tx.meta.postBalances : [];

  const accountKeys = tx.transaction.message.staticAccountKeys
    ? tx.transaction.message.staticAccountKeys.map((k) => k.toString())
    : tx.transaction.message.accountKeys.map((k) => k.toString());

  let observedAmount = 0;

  if (expectedToken === SOLANA_TOKENS.SOL) {
    for (let i = 0; i < accountKeys.length; i++) {
      if (accountKeys[i] === expectedRecipient) {
        observedAmount = (postBalances[i] - preBalances[i]) / 1_000_000_000;
      }
    }
  } else {
    const preTokenBalances = tx.meta ? tx.meta.preTokenBalances || [] : [];
    const postTokenBalances = tx.meta ? tx.meta.postTokenBalances || [] : [];

    for (const post of postTokenBalances) {
      if (post.owner === expectedRecipient) {
        const pre = preTokenBalances.find((p) => p.accountIndex === post.accountIndex);
        const preAmount = pre ? Number(pre.uiTokenAmount.uiAmount || 0) : 0;
        const postAmount = Number(post.uiTokenAmount.uiAmount || 0);
        observedAmount += postAmount - preAmount;
      }
    }
  }

  const tolerance = 0.000001;
  const matches = Math.abs(observedAmount - expectedAmount) < tolerance;

  if (!matches) {
    logger.warn(
      { paymentId, txSignature, expectedAmount, observedAmount },
      'Payment amount mismatch',
    );
    return { verified: false, reason: 'AMOUNT_MISMATCH', observedAmount, expectedAmount };
  }

  return { verified: true, observedAmount };
}

export async function verifyPayment({ paymentId }) {
  if (!paymentId) {
    throw new AppError('paymentId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await solanaPaymentRepository.findById({ paymentId });

  if (!record) {
    throw new AppError('Payment not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (!record.tx_signature) {
    return { verified: false, reason: 'NO_SIGNATURE' };
  }

  return verifyTransaction({
    paymentId,
    txSignature: record.tx_signature,
    expectedAmount: Number(record.amount),
    expectedToken: record.token,
    expectedRecipient: record.recipient_wallet,
  });
}

export const paymentVerificationService = {
  verifyTransaction,
  verifyPayment,
};