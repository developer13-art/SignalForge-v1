/**
 * Wallet Validator
 *
 * @module server/modules/solana/wallets/wallet.validator
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { normalizeSolanaAddress, isValidSolanaAddress } = require('@signalforge/shared/validators/wallet-address.validator');

const MAX_LABEL_LENGTH = 64;
const MIN_SIGNATURE_LENGTH = 64;
const MAX_SIGNATURE_LENGTH = 128;
const MAX_MESSAGE_LENGTH = 4096;
function validateWalletAddress(walletAddress) {
  if (!walletAddress || typeof walletAddress !== 'string') {
    throw new AppError('walletAddress is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const normalized = normalizeSolanaAddress(walletAddress);

  if (!normalized || !isValidSolanaAddress(normalized)) {
    throw new AppError('walletAddress is not a valid Solana address', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return normalized;
}
function validateLabel(label) {
  if (label === undefined || label === null) {
    return null;
  }
  if (typeof label !== 'string') {
    throw new AppError('label must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  const trimmed = label.trim();
  if (trimmed.length > MAX_LABEL_LENGTH) {
    throw new AppError(`label must not exceed ${MAX_LABEL_LENGTH} characters`, ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return trimmed || null;
}
function validateBeginConnectPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return {
    walletAddress: validateWalletAddress(payload.walletAddress),
  };
}
function validateCompleteConnectPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const walletAddress = validateWalletAddress(payload.walletAddress);

  if (!payload.message || typeof payload.message !== 'string') {
    throw new AppError('message is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (payload.message.length > MAX_MESSAGE_LENGTH) {
    throw new AppError('message is too long', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!payload.signatureBase58 || typeof payload.signatureBase58 !== 'string') {
    throw new AppError('signatureBase58 is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const sig = payload.signatureBase58.trim();

  if (sig.length < MIN_SIGNATURE_LENGTH || sig.length > MAX_SIGNATURE_LENGTH) {
    throw new AppError('signatureBase58 is not a valid length', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const label = validateLabel(payload.label);

  return {
    walletAddress,
    message: payload.message,
    signatureBase58: sig,
    isPrimary: Boolean(payload.isPrimary),
    label,
  };
}
function validateSetPrimaryPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  if (!payload.walletId || typeof payload.walletId !== 'string') {
    throw new AppError('walletId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return { walletId: payload.walletId };
}
const WALLET_VALIDATION_CONSTRAINTS = Object.freeze({
  maxLabelLength: MAX_LABEL_LENGTH,
  minSignatureLength: MIN_SIGNATURE_LENGTH,
  maxSignatureLength: MAX_SIGNATURE_LENGTH,
  maxMessageLength: MAX_MESSAGE_LENGTH,
});
module.exports.WALLET_VALIDATION_CONSTRAINTS = WALLET_VALIDATION_CONSTRAINTS;
module.exports.validateWalletAddress = validateWalletAddress;
module.exports.validateLabel = validateLabel;
module.exports.validateBeginConnectPayload = validateBeginConnectPayload;
module.exports.validateCompleteConnectPayload = validateCompleteConnectPayload;
module.exports.validateSetPrimaryPayload = validateSetPrimaryPayload;
