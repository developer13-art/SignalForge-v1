'use strict';

const { PublicKey, VersionedTransaction, Transaction } = require('@solana/web3.js');

const {
  SIGNATURE_STATES,
  SHARED_ERROR_CODES,
} = require('./shared.constants');

/**
 * SignalForge - Shared Transaction Signer Service
 *
 * Provides helpers for validating and inspecting signed transactions
 * without ever signing on behalf of a user. Gateways use this service
 * to confirm that the transactions they receive back from wallets
 * carry the expected signatures before they are submitted.
 */

class SignerError extends Error {
  constructor(message, code = SHARED_ERROR_CODES.INVALID_REQUEST) {
    super(message);
    this.name = 'SignerError';
    this.code = code;
    this.isSharedDexError = true;
  }
}

function isVersionedTransaction(transaction) {
  return transaction instanceof VersionedTransaction;
}

function isLegacyTransaction(transaction) {
  return transaction instanceof Transaction;
}

function extractSignatures(transaction) {
  if (isVersionedTransaction(transaction)) {
    return transaction.signatures.map((signature) => ({
      signature: signature ? Buffer.from(signature).toString('base64') : null,
      present: Boolean(signature),
    }));
  }
  if (isLegacyTransaction(transaction)) {
    return transaction.signatures.map((entry) => ({
      publicKey: entry.publicKey ? entry.publicKey.toBase58() : null,
      signature: entry.signature ? Buffer.from(entry.signature).toString('base64') : null,
      present: Boolean(entry.signature),
    }));
  }
  return [];
}

function countPresentSignatures(transaction) {
  return extractSignatures(transaction).filter((entry) => entry.present).length;
}

function countRequiredSignatures(transaction) {
  if (isVersionedTransaction(transaction)) {
    return transaction.message.header.numRequiredSignatures;
  }
  if (isLegacyTransaction(transaction)) {
    return transaction.signatures.length;
  }
  return 0;
}

function resolveSignatureState(transaction) {
  if (!transaction) {
    return SIGNATURE_STATES.UNSIGNED;
  }
  const required = countRequiredSignatures(transaction);
  const present = countPresentSignatures(transaction);
  if (present === 0) {
    return SIGNATURE_STATES.UNSIGNED;
  }
  if (present < required) {
    return SIGNATURE_STATES.PARTIALLY_SIGNED;
  }
  return SIGNATURE_STATES.FULLY_SIGNED;
}

function assertExpectedSigner(transaction, expectedSigner) {
  if (!expectedSigner) {
    return true;
  }
  let expectedPublicKey;
  try {
    expectedPublicKey = new PublicKey(expectedSigner);
  } catch (error) {
    throw new SignerError(`expectedSigner is not a valid Solana address: ${error.message}`);
  }

  const expectedAddress = expectedPublicKey.toBase58();

  const signatures = extractSignatures(transaction);

  const matching = signatures.find(
    (entry) => entry.publicKey === expectedAddress && entry.present,
  );

  if (!matching) {
    throw new SignerError(
      `Expected signer ${expectedAddress} did not sign the transaction`,
      SHARED_ERROR_CODES.TRANSACTION_SIGNATURE_MISMATCH,
    );
  }

  return true;
}

function assertFullySigned(transaction, { expectedSigner } = {}) {
  const state = resolveSignatureState(transaction);
  if (state !== SIGNATURE_STATES.FULLY_SIGNED) {
    throw new SignerError(
      `Transaction is not fully signed (state: ${state})`,
      SHARED_ERROR_CODES.TRANSACTION_SIGNATURE_MISMATCH,
    );
  }
  if (expectedSigner) {
    return assertExpectedSigner(transaction, expectedSigner);
  }
  return true;
}

function assertNotSigned(transaction) {
  const state = resolveSignatureState(transaction);
  if (state !== SIGNATURE_STATES.UNSIGNED) {
    throw new SignerError(
      `Transaction is already partially or fully signed (state: ${state})`,
      SHARED_ERROR_CODES.TRANSACTION_ALREADY_SUBMITTED,
    );
  }
  return true;
}

function summarizeTransaction(transaction) {
  if (!transaction) {
    return null;
  }
  return {
    type: isVersionedTransaction(transaction) ? 'versioned' : isLegacyTransaction(transaction) ? 'legacy' : 'unknown',
    requiredSignatures: countRequiredSignatures(transaction),
    presentSignatures: countPresentSignatures(transaction),
    state: resolveSignatureState(transaction),
    signatures: extractSignatures(transaction),
  };
}

module.exports = {
  SignerError,
  isVersionedTransaction,
  isLegacyTransaction,
  extractSignatures,
  countPresentSignatures,
  countRequiredSignatures,
  resolveSignatureState,
  assertExpectedSigner,
  assertFullySigned,
  assertNotSigned,
  summarizeTransaction,
};