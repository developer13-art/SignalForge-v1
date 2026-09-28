/**
 * Solana Payment Service
 *
 * Top-level orchestration for Solana payments. Creates payment
 * intents, attaches signatures, tracks status transitions, and
 * refunds. All on-chain work is delegated to the transaction
 * sub-module; this service only manages the payment record.
 *
 * @module server/modules/solana/payments/solana-payment.service
 */

import crypto from 'node:crypto';
import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import { SOLANA_TOKENS } from '../solana.constants';
import { programConfigService } from '../config/program-config.service';
import { networkService } from '../config/network.service';
import { solanaPaymentRepository } from './solana-payment.repository';
import { solPaymentService } from './sol-payment.service';
import { splTokenPaymentService } from './spl-token-payment.service';
import { emitPaymentConfirmed } from '../solana.events';

function mapPayment(row) {
  return {
    paymentId: row.id,
    userId: row.user_id,
    subscriptionId: row.subscription_id,
    purpose: row.purpose,
    amount: Number(row.amount),
    token: row.token,
    tokenMint: row.token_mint,
    senderWallet: row.sender_wallet,
    recipientWallet: row.recipient_wallet,
    reference: row.reference,
    memo: row.memo,
    amountUsd: row.amount_usd ? Number(row.amount_usd) : null,
    exchangeRate: row.exchange_rate ? Number(row.exchange_rate) : null,
    txSignature: row.tx_signature,
    slot: row.slot,
    blockTime: row.block_time,
    confirmations: row.confirmations,
    status: row.status,
    failureReason: row.failure_reason,
    expiresAt: row.expires_at,
    submittedAt: row.submitted_at,
    confirmedAt: row.confirmed_at,
    finalizedAt: row.finalized_at,
    refundedAt: row.refunded_at,
    refundTxSignature: row.refund_tx_signature,
    refundReason: row.refund_reason,
    createdAt: row.created_at,
  };
}

function generateReference() {
  return `sf_${crypto.randomBytes(12).toString('base64url')}`;
}

export async function createPayment({
  userId,
  subscriptionId,
  purpose,
  amount,
  token,
  recipientWallet,
  memo,
  reference,
  expiresInMinutes = 30,
}) {
  if (!userId || !amount || !token) {
    throw new AppError('userId, amount, and token are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let resolvedRecipient = recipientWallet;

  if (!resolvedRecipient) {
    resolvedRecipient = programConfigService.getTreasuryWallet();
  }

  let tokenMint = null;
  let resolvedAmount = Number(amount);

  if (token === SOLANA_TOKENS.SOL) {
    resolvedAmount = solPaymentService.validateSolAmount({ amount: resolvedAmount });
  } else {
    resolvedAmount = splTokenPaymentService.validateTokenAmount({ token, amount: resolvedAmount });
    tokenMint = splTokenPaymentService.getTokenMint({ token });
  }

  const resolvedReference = reference || generateReference();
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

  const record = await solanaPaymentRepository.insertPayment({
    userId,
    subscriptionId,
    purpose: purpose || 'SUBSCRIPTION',
    amount: resolvedAmount,
    token,
    tokenMint,
    recipientWallet: resolvedRecipient,
    reference: resolvedReference,
    memo: memo || null,
    expiresAt,
    status: 'AWAITING_SIGNATURE',
  });

  logger.info(
    { paymentId: record.id, userId, token, amount: resolvedAmount, reference: resolvedReference },
    'Solana payment intent created',
  );

  const network = networkService.getNetworkInfo();

  return {
    ...mapPayment(record),
    network: {
      network: network.network,
      rpcUrl: network.rpcUrl,
    },
    instructions: buildInstructions({
      token,
      amount: resolvedAmount,
      recipientWallet: resolvedRecipient,
      tokenMint,
      memo,
      reference: resolvedReference,
    }),
  };
}

function buildInstructions({ token, amount, recipientWallet, tokenMint, memo, reference }) {
  if (token === SOLANA_TOKENS.SOL) {
    return [solPaymentService.buildSolTransferRequest({ amount, recipientWallet })];
  }

  return [
    splTokenPaymentService.buildSplTokenTransferRequest({
      token,
      amount,
      recipientWallet,
    }),
    {
      type: 'MEMO',
      memo: memo || null,
      reference,
      mint: tokenMint,
    },
  ];
}

export async function attachSignature({ paymentId, txSignature, senderWallet }) {
  if (!paymentId || !txSignature) {
    throw new AppError('paymentId and txSignature are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const existing = await solanaPaymentRepository.findBySignature({ txSignature });

  if (existing && existing.id !== paymentId) {
    throw new AppError('This transaction signature is already used for another payment', ERROR_CODES.CONFLICT, 409);
  }

  const record = await solanaPaymentRepository.findById({ paymentId });

  if (!record) {
    throw new AppError('Payment not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (record.status !== 'AWAITING_SIGNATURE') {
    throw new AppError(`Cannot attach signature: payment is ${record.status}`, ERROR_CODES.CONFLICT, 409);
  }

  const updated = await solanaPaymentRepository.attachSignature({
    paymentId,
    txSignature,
    senderWallet,
  });

  if (!updated) {
    throw new AppError('Failed to attach signature', ERROR_CODES.INTERNAL_ERROR, 500);
  }

  logger.info({ paymentId, txSignature }, 'Signature attached to Solana payment');

  return getPayment({ paymentId });
}

export async function getPayment({ paymentId }) {
  if (!paymentId) {
    throw new AppError('paymentId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await solanaPaymentRepository.findById({ paymentId });

  if (!record) {
    throw new AppError('Payment not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return mapPayment(record);
}

export async function listPayments({ userId, filters = {}, pagination = {} }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { page, limit, offset } = normalizePagination(pagination);

  const result = await solanaPaymentRepository.listByUser({
    userId,
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map(mapPayment),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function markConfirmed({
  paymentId,
  txSignature,
  slot,
  blockTime,
  confirmations,
}) {
  if (!paymentId) {
    throw new AppError('paymentId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await solanaPaymentRepository.updateStatus({
    paymentId,
    status: 'CONFIRMED',
    txSignature,
    slot,
    blockTime,
    confirmations,
  });

  if (!updated) {
    throw new AppError('Payment not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const record = await solanaPaymentRepository.findById({ paymentId });

  await emitPaymentConfirmed({
    paymentId,
    userId: record.user_id,
    amount: Number(record.amount),
    token: record.token,
    txSignature: record.tx_signature,
  }).catch((err) => logger.warn({ err }, 'Failed to emit payment confirmed event'));

  logger.info({ paymentId, txSignature }, 'Solana payment confirmed');

  return { confirmed: true };
}

export async function markFailed({ paymentId, reason }) {
  if (!paymentId) {
    throw new AppError('paymentId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await solanaPaymentRepository.updateStatus({
    paymentId,
    status: 'FAILED',
    failureReason: reason || 'UNKNOWN',
  });

  return { failed: updated };
}

export async function markExpired({ paymentId }) {
  if (!paymentId) {
    throw new AppError('paymentId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await solanaPaymentRepository.updateStatus({
    paymentId,
    status: 'EXPIRED',
  });

  return { expired: updated };
}

export async function refundPayment({ paymentId, refundTxSignature, reason }) {
  if (!paymentId) {
    throw new AppError('paymentId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await solanaPaymentRepository.findById({ paymentId });

  if (!record) {
    throw new AppError('Payment not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (record.status !== 'CONFIRMED' && record.status !== 'FINALIZED') {
    throw new AppError('Only confirmed payments can be refunded', ERROR_CODES.CONFLICT, 409);
  }

  const refunded = await solanaPaymentRepository.markRefunded({
    paymentId,
    refundTxSignature,
    reason,
  });

  logger.info({ paymentId, refundTxSignature }, 'Solana payment refunded');

  return { refunded };
}

export async function getStatusBreakdown() {
  const rows = await solanaPaymentRepository.countByStatus();

  const breakdown = {};
  let totalUsd = 0;

  for (const row of rows) {
    breakdown[row.status] = {
      count: row.count,
      totalUsd: Number(row.total_usd || 0),
    };
    totalUsd += Number(row.total_usd || 0);
  }

  return { breakdown, totalUsd };
}

export async function sweepExpiredPayments({ limit = 200 }) {
  const expired = await solanaPaymentRepository.findExpired({ limit });

  const results = [];

  for (const payment of expired) {
    const result = await markExpired({ paymentId: payment.id });
    results.push({ paymentId: payment.id, ...result });
  }

  return { processed: results.length, results };
}

export const solanaPaymentService = {
  createPayment,
  attachSignature,
  getPayment,
  listPayments,
  markConfirmed,
  markFailed,
  markExpired,
  refundPayment,
  getStatusBreakdown,
  sweepExpiredPayments,
};