'use strict';

const { PublicKey } = require('@solana/web3.js');

const {
  SHARED_ERROR_CODES,
} = require('./shared.constants');

const transactionSigner = require('./transaction-signer.service');

/**
 * SignalForge - Shared Transaction Validator Service
 *
 * Performs structural validation on transactions before they are
 * submitted to the network. Validators here are cheap and do not
 * touch the network; deeper checks belong in each gateway.
 */

class TransactionValidationError extends Error {
  constructor(message, code = SHARED_ERROR_CODES.TRANSACTION_INVALID, details = null) {
    super(message);
    this.name = 'TransactionValidationError';
    this.code = code;
    this.details = details;
    this.isSharedDexError = true;
  }
}

function isBase58Address(value) {
  if (!value || typeof value !== 'string') {
    return false;
  }
  try {
    // eslint-disable-next-line no-new
    new PublicKey(value);
    return true;
  } catch (_error) {
    return false;
  }
}

function validateSerializedTransaction(serialized) {
  if (!serialized || typeof serialized !== 'string') {
    throw new TransactionValidationError('Serialized transaction is required');
  }

  const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
  if (!base64Pattern.test(serialized)) {
    throw new TransactionValidationError('Serialized transaction must be base64-encoded');
  }

  const minLength = 100;
  if (serialized.length < minLength) {
    throw new TransactionValidationError(
      `Serialized transaction is too short (min ${minLength} characters)`,
      SHARED_ERROR_CODES.TRANSACTION_INVALID,
      { length: serialized.length },
    );
  }

  return true;
}

function validateUserPublicKey(userPublicKey) {
  if (!userPublicKey || typeof userPublicKey !== 'string') {
    throw new TransactionValidationError('userPublicKey is required');
  }
  if (!isBase58Address(userPublicKey)) {
    throw new TransactionValidationError('userPublicKey must be a base58 Solana address');
  }
  return true;
}

function validateMintAddress(mint) {
  if (!mint || typeof mint !== 'string') {
    throw new TransactionValidationError('mint is required');
  }
  if (!isBase58Address(mint)) {
    throw new TransactionValidationError(`mint ${mint} must be a base58 Solana address`);
  }
  return true;
}

function validateAmount(value, { name = 'amount', allowZero = false } = {}) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    throw new TransactionValidationError(`${name} must be a finite number`);
  }
  if (numeric < 0) {
    throw new TransactionValidationError(`${name} must not be negative`);
  }
  if (!allowZero && numeric === 0) {
    throw new TransactionValidationError(`${name} must be greater than zero`);
  }
  return true;
}

function validateTransactionRequest({
  userPublicKey,
  inputMint,
  outputMint,
  amount,
  slippageBps,
} = {}) {
  validateUserPublicKey(userPublicKey);
  if (inputMint) {
    validateMintAddress(inputMint);
  }
  if (outputMint) {
    validateMintAddress(outputMint);
  }
  if (amount !== undefined) {
    validateAmount(amount, { name: 'amount' });
  }
  if (slippageBps !== undefined && slippageBps !== null) {
    const numeric = Number(slippageBps);
    if (!Number.isFinite(numeric) || numeric < 1) {
      throw new TransactionValidationError('slippageBps must be a positive integer');
    }
  }
  return true;
}

function validateSignedTransaction(transaction, { expectedSigner } = {}) {
  if (!transaction) {
    throw new TransactionValidationError('Transaction is required');
  }
  transactionSigner.assertFullySigned(transaction, { expectedSigner });
  return true;
}

function validateUnsignedTransaction(transaction) {
  if (!transaction) {
    throw new TransactionValidationError('Transaction is required');
  }
  transactionSigner.assertNotSigned(transaction);
  return true;
}

function assertNoDuplicateSigners(transaction) {
  const signatures = transactionSigner.extractSignatures(transaction);
  const addresses = signatures.map((entry) => entry.publicKey).filter(Boolean);
  const unique = new Set(addresses);
  if (unique.size !== addresses.length) {
    throw new TransactionValidationError('Transaction contains duplicate signers');
  }
  return true;
}

module.exports = {
  TransactionValidationError,
  isBase58Address,
  validateSerializedTransaction,
  validateUserPublicKey,
  validateMintAddress,
  validateAmount,
  validateTransactionRequest,
  validateSignedTransaction,
  validateUnsignedTransaction,
  assertNoDuplicateSigners,
};