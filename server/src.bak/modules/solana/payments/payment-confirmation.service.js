/**
 * Payment Confirmation Service
 *
 * Orchestrates payment confirmation by fetching the transaction,
 * verifying it, and updating the payment record. Exposes a single
 * entry point for the payment indexer and for out-of-band
 * confirmation.
 *
 * @module server/modules/solana/payments/payment-confirmation.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { connectionService } from '../config/connection.service';
import { solanaPaymentRepository } from './solana-payment.repository';
import { paymentVerificationService } from './payment-verification.service';
import { solanaPaymentService } from './solana-payment.service';

const MAX_CONFIRMATION_ATTEMPTS = 5;

export async function confirmPayment({ paymentId }) {
  if (!paymentId) {
    throw new AppError('paymentId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await solanaPaymentRepository.findById({ paymentId });

  if (!record) {
    throw new AppError('Payment not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (record.status === 'CONFIRMED' || record.status === 'FINALIZED') {
    return { confirmed: true, alreadyConfirmed: true };
  }

  if (!record.tx_signature) {
    return { confirmed: false, reason: 'NO_SIGNATURE' };
  }

  const verification = await paymentVerificationService.verifyPayment({ paymentId });

  if (!verification.verified) {
    logger.warn({ paymentId, reason: verification.reason }, 'Payment verification failed');
    return { confirmed: false, reason: verification.reason };
  }

  let slot = null;
  let blockTime = null;
  let confirmations = null;

  try {
    const connection = await connectionService.getConnection();
    const tx = await connection.getTransaction(record.tx_signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (tx) {
      slot = tx.slot;
      blockTime = tx.blockTime;
    }

    const currentSlot = await connection.getSlot();
    if (slot) {
      confirmations = currentSlot - slot;
    }
  } catch (err) {
    logger.warn({ err, paymentId }, 'Failed to fetch confirmation metadata');
  }

  await solanaPaymentService.markConfirmed({
    paymentId,
    txSignature: record.tx_signature,
    slot,
    blockTime,
    confirmations,
  });

  return { confirmed: true, slot, blockTime, confirmations };
}

export async function confirmPendingPayments({ limit = 100 }) {
  const pending = await solanaPaymentRepository.findPendingForVerification({ limit });

  const results = [];

  for (const payment of pending) {
    try {
      const result = await confirmPayment({ paymentId: payment.id });
      results.push({ paymentId: payment.id, ...result });
    } catch (err) {
      logger.warn({ err, paymentId: payment.id }, 'Confirmation sweep failed for payment');
      results.push({ paymentId: payment.id, confirmed: false, error: err.message });
    }
  }

  return { processed: results.length, results };
}

export const paymentConfirmationService = {
  confirmPayment,
  confirmPendingPayments,
  MAX_CONFIRMATION_ATTEMPTS,
};