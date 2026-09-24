/**
 * Solana Validator
 *
 * Validation helpers for Solana payloads: wallet addresses, tx
 * signatures, attestation inputs, payment inputs, and provenance
 * records.
 *
 * @module server/modules/solana/solana.validator
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import {
  isValidSolanaAddress,
  normalizeSolanaAddress,
} from '@signalforge/shared/validators/wallet-address.validator';
import { isValidTxSignature } from '@signalforge/shared/validators/tx-signature.validator';
import {
  SOLANA_ATTESTATION_PUBLIC_FIELD_WHITELIST,
  SOLANA_MEMO_MAX_LENGTH,
  isValidToken,
} from './solana.constants';

export function validateWalletAddress({ walletAddress, fieldName = 'walletAddress' }) {
  if (!walletAddress || typeof walletAddress !== 'string') {
    throw new AppError(`${fieldName} is required`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const normalized = normalizeSolanaAddress(walletAddress);

  if (!normalized || !isValidSolanaAddress(normalized)) {
    throw new AppError(`${fieldName} is not a valid Solana address`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return normalized;
}

export function validateTxSignature({ txSignature, fieldName = 'txSignature' }) {
  if (!txSignature || typeof txSignature !== 'string') {
    throw new AppError(`${fieldName} is required`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const trimmed = txSignature.trim();

  if (!isValidTxSignature(trimmed)) {
    throw new AppError(`${fieldName} is not a valid Solana transaction signature`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return trimmed;
}

export function validateAttestationPayload({
  subjectType,
  subjectId,
  attestationType,
  publicData,
  onChainData,
}) {
  if (!subjectType || !subjectId || !attestationType) {
    throw new AppError(
      'subjectType, subjectId, and attestationType are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const whitelisted = filterPublicFields({ data: publicData });

  return {
    subjectType,
    subjectId,
    attestationType,
    publicData: whitelisted,
    onChainData: onChainData || null,
  };
}

export function validateProvenancePayload({ signalId, aiVersion, processingHash, publicData }) {
  if (!signalId || !aiVersion || !processingHash) {
    throw new AppError(
      'signalId, aiVersion, and processingHash are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  if (!/^[a-f0-9]{64}$/i.test(processingHash)) {
    throw new AppError('processingHash must be a 64-character hex string', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return {
    signalId,
    aiVersion,
    processingHash,
    publicData: filterPublicFields({ data: publicData }),
  };
}

export function validatePaymentPayload({
  userId,
  amount,
  token,
  recipientWallet,
  purpose,
  memo,
  reference,
}) {
  if (!userId || amount === undefined || !token || !recipientWallet) {
    throw new AppError(
      'userId, amount, token, and recipientWallet are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const amountNumber = Number(amount);

  if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
    throw new AppError('amount must be a positive number', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!isValidToken(token)) {
    throw new AppError(`Unsupported token: ${token}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const recipient = validateWalletAddress({ walletAddress: recipientWallet, fieldName: 'recipientWallet' });

  let memoText = null;
  if (memo !== undefined && memo !== null) {
    if (typeof memo !== 'string') {
      throw new AppError('memo must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    if (memo.length > SOLANA_MEMO_MAX_LENGTH) {
      throw new AppError(`memo exceeds ${SOLANA_MEMO_MAX_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
    memoText = memo;
  }

  const validPurposes = ['SUBSCRIPTION', 'WALLET_TOPUP', 'PROVIDER_SUBSCRIPTION', 'OTHER'];

  const resolvedPurpose = purpose || 'SUBSCRIPTION';

  if (!validPurposes.includes(resolvedPurpose)) {
    throw new AppError(`Invalid purpose: ${resolvedPurpose}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return {
    userId,
    amount: amountNumber,
    token,
    recipientWallet: recipient,
    purpose: resolvedPurpose,
    memo: memoText,
    reference: reference || null,
  };
}

export function filterPublicFields({ data }) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const filtered = {};

  for (const [key, value] of Object.entries(data)) {
    if (SOLANA_ATTESTATION_PUBLIC_FIELD_WHITELIST.includes(key)) {
      filtered[key] = value;
    }
  }

  return Object.keys(filtered).length > 0 ? filtered : null;
}

export function validateSignedMessage({ message, signature, walletAddress }) {
  if (!message || typeof message !== 'string') {
    throw new AppError('message is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!signature || typeof signature !== 'string') {
    throw new AppError('signature is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (message.length > 4096) {
    throw new AppError('message is too long', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const address = validateWalletAddress({ walletAddress });

  return { message, signature, walletAddress: address };
}

export const SOLANA_VALIDATION_CONSTRAINTS = Object.freeze({
  maxMemoLength: SOLANA_MEMO_MAX_LENGTH,
  maxMessageLength: 4096,
});