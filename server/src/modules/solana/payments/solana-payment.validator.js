/**
 * Solana Payment Validator
 *
 * @module server/modules/solana/payments/solana-payment.validator
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import {
  validateWalletAddress,
  validateTxSignature,
} from '../solana.validator';
import { SOLANA_TOKEN_VALUES, SOLANA_MEMO_MAX_LENGTH } from '../solana.constants';

const VALID_PURPOSES = ['SUBSCRIPTION', 'WALLET_TOPUP', 'PROVIDER_SUBSCRIPTION', 'OTHER'];

const MIN_AMOUNT = 0.000001;
const MAX_AMOUNT = 1_000_000;

export function validateCreatePaymentPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.token || !SOLANA_TOKEN_VALUES.includes(payload.token)) {
    throw new AppError(`Invalid token: ${payload.token}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const amount = Number(payload.amount);

  if (!Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    throw new AppError(`amount must be between ${MIN_AMOUNT} and ${MAX_AMOUNT}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const purpose = payload.purpose || 'SUBSCRIPTION';

  if (!VALID_PURPOSES.includes(purpose)) {
    throw new AppError(`Invalid purpose: ${purpose}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let recipientWallet = null;
  if (payload.recipientWallet) {
    recipientWallet = validateWalletAddress({ walletAddress: payload.recipientWallet, fieldName: 'recipientWallet' });
  }

  let memo = null;
  if (payload.memo !== undefined && payload.memo !== null) {
    if (typeof payload.memo !== 'string') {
      throw new AppError('memo must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    if (payload.memo.length > SOLANA_MEMO_MAX_LENGTH) {
      throw new AppError(`memo exceeds ${SOLANA_MEMO_MAX_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
    memo = payload.memo;
  }

  let reference = null;
  if (payload.reference !== undefined && payload.reference !== null) {
    if (typeof payload.reference !== 'string' || payload.reference.length > 128) {
      throw new AppError('reference is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    reference = payload.reference;
  }

  return {
    subscriptionId: payload.subscriptionId || null,
    purpose,
    amount,
    token: payload.token,
    recipientWallet,
    memo,
    reference,
    expiresInMinutes: Number(payload.expiresInMinutes) || 30,
  };
}

export function validateAttachSignaturePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const txSignature = validateTxSignature({
    txSignature: payload.txSignature,
    fieldName: 'txSignature',
  });

  let senderWallet = null;
  if (payload.senderWallet) {
    senderWallet = validateWalletAddress({
      walletAddress: payload.senderWallet,
      fieldName: 'senderWallet',
    });
  }

  return { txSignature, senderWallet };
}

export function validateRefundPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let refundTxSignature = null;
  if (payload.refundTxSignature) {
    refundTxSignature = validateTxSignature({
      txSignature: payload.refundTxSignature,
      fieldName: 'refundTxSignature',
    });
  }

  let reason = null;
  if (payload.reason !== undefined && payload.reason !== null) {
    if (typeof payload.reason !== 'string' || payload.reason.length > 512) {
      throw new AppError('reason is invalid', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    reason = payload.reason;
  }

  return { refundTxSignature, reason };
}

export const SOLANA_PAYMENT_VALIDATION_CONSTRAINTS = Object.freeze({
  minAmount: MIN_AMOUNT,
  maxAmount: MAX_AMOUNT,
  validPurposes: VALID_PURPOSES,
});