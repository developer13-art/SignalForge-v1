/**
 * Solana Payment Schema
 *
 * Defines the structure of a Solana payment in SignalForge. Solana
 * payments coexist with fiat payments from Stripe, Paystack, and
 * Flutterwave, and are used for subscription funding and wallet top-ups.
 *
 * @module @signalforge/shared/schemas/solana-payment
 */

import { SOLANA_PAYMENT_STATUS_VALUES } from '../constants/solana-payment-statuses.js';
import { SOLANA_TOKEN_VALUES } from '../constants/solana-tokens.js';

export const SOLANA_PAYMENT_SCHEMA = Object.freeze({
  type: 'object',
  required: [
    'paymentId',
    'userId',
    'amount',
    'token',
    'recipientWallet',
    'status',
    'createdAt',
  ],
  properties: {
    paymentId: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    subscriptionId: { type: 'string', format: 'uuid', nullable: true },
    purpose: {
      type: 'string',
      enum: ['SUBSCRIPTION', 'WALLET_TOPUP', 'PROVIDER_SUBSCRIPTION', 'OTHER'],
      default: 'SUBSCRIPTION',
    },
    amount: { type: 'number', minimum: 0 },
    token: { type: 'string', enum: SOLANA_TOKEN_VALUES },
    amountUsd: { type: 'number', nullable: true, minimum: 0 },
    exchangeRate: { type: 'number', nullable: true, minimum: 0 },
    senderWallet: { type: 'string', nullable: true, maxLength: 64 },
    recipientWallet: { type: 'string', minLength: 32, maxLength: 64 },
    tokenMint: { type: 'string', nullable: true, maxLength: 64 },
    reference: { type: 'string', nullable: true, maxLength: 128 },
    memo: { type: 'string', nullable: true, maxLength: 255 },
    txSignature: { type: 'string', nullable: true, maxLength: 128 },
    slot: { type: 'number', nullable: true, minimum: 0 },
    blockTime: { type: 'number', nullable: true, minimum: 0 },
    network: { type: 'string', nullable: true, maxLength: 32 },
    confirmations: { type: 'number', nullable: true, minimum: 0 },
    status: { type: 'string', enum: SOLANA_PAYMENT_STATUS_VALUES },
    expiresAt: { type: 'string', format: 'date-time', nullable: true },
    submittedAt: { type: 'string', format: 'date-time', nullable: true },
    confirmedAt: { type: 'string', format: 'date-time', nullable: true },
    finalizedAt: { type: 'string', format: 'date-time', nullable: true },
    failureReason: { type: 'string', nullable: true, maxLength: 1024 },
    refundedAt: { type: 'string', format: 'date-time', nullable: true },
    refundTxSignature: { type: 'string', nullable: true, maxLength: 128 },
    createdAt: { type: 'string', format: 'date-time' },
    metadata: { type: 'object', nullable: true },
  },
  additionalProperties: false,
});

export function buildSolanaPayment(input) {
  return {
    paymentId: input.paymentId,
    userId: input.userId,
    subscriptionId: input.subscriptionId || null,
    purpose: input.purpose || 'SUBSCRIPTION',
    amount: input.amount,
    token: input.token,
    amountUsd: input.amountUsd ?? null,
    exchangeRate: input.exchangeRate ?? null,
    senderWallet: input.senderWallet || null,
    recipientWallet: input.recipientWallet,
    tokenMint: input.tokenMint || null,
    reference: input.reference || null,
    memo: input.memo || null,
    txSignature: input.txSignature || null,
    slot: input.slot ?? null,
    blockTime: input.blockTime ?? null,
    network: input.network || null,
    confirmations: input.confirmations ?? null,
    status: input.status,
    expiresAt: input.expiresAt || null,
    submittedAt: input.submittedAt || null,
    confirmedAt: input.confirmedAt || null,
    finalizedAt: input.finalizedAt || null,
    failureReason: input.failureReason || null,
    refundedAt: input.refundedAt || null,
    refundTxSignature: input.refundTxSignature || null,
    createdAt: input.createdAt || new Date().toISOString(),
    metadata: input.metadata || null,
  };
}

export function validateSolanaPayment(payment) {
  const errors = [];

  if (!payment || typeof payment !== 'object') {
    return { valid: false, errors: ['Solana payment must be an object'] };
  }

  for (const field of SOLANA_PAYMENT_SCHEMA.required) {
    if (payment[field] === undefined || payment[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (payment.token && !SOLANA_TOKEN_VALUES.includes(payment.token)) {
    errors.push(`Invalid token: ${payment.token}`);
  }

  if (
    payment.status &&
    !SOLANA_PAYMENT_STATUS_VALUES.includes(payment.status)
  ) {
    errors.push(`Invalid status: ${payment.status}`);
  }

  if (typeof payment.amount === 'number' && payment.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  return { valid: errors.length === 0, errors };
}

export const SOLANA_PAYMENT_FIELDS = Object.freeze(
  Object.keys(SOLANA_PAYMENT_SCHEMA.properties),
);