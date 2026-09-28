'use strict';

const { Transaction, VersionedTransaction } = require('@solana/web3.js');

const { InvalidParameterError } = require('../actions.errors');

/**
 * SignalForge - Transaction Serializer Service
 *
 * Serializes legacy and versioned Solana transactions into the base64
 * wire format expected by the Solana Actions specification. Also
 * performs the reverse operation so that the backend can accept a
 * signed transaction from a wallet for inspection or confirmation.
 */

function serializeLegacyTransaction(transaction, options = {}) {
  if (!(transaction instanceof Transaction)) {
    throw new InvalidParameterError('Expected a legacy Transaction instance');
  }

  const requireAllSignatures = options.requireAllSignatures !== false;
  const verifySignatures = options.verifySignatures !== false;

  const serialized = transaction.serialize({
    requireAllSignatures,
    verifySignatures,
  });

  return Buffer.from(serialized).toString('base64');
}

function serializeVersionedTransaction(transaction, options = {}) {
  if (!(transaction instanceof VersionedTransaction)) {
    throw new InvalidParameterError('Expected a VersionedTransaction instance');
  }

  const requireAllSignatures = options.requireAllSignatures !== false;

  const serialized = transaction.serialize({
    requireAllSignatures,
  });

  return Buffer.from(serialized).toString('base64');
}

function serializeTransaction(transaction, options = {}) {
  if (transaction instanceof VersionedTransaction) {
    return serializeVersionedTransaction(transaction, options);
  }
  if (transaction instanceof Transaction) {
    return serializeLegacyTransaction(transaction, options);
  }
  throw new InvalidParameterError('Unsupported transaction type');
}

function deserializeLegacyTransaction(base64) {
  if (!base64 || typeof base64 !== 'string') {
    throw new InvalidParameterError('Base64 transaction payload is required');
  }
  const buffer = Buffer.from(base64, 'base64');
  return Transaction.from(buffer);
}

function deserializeVersionedTransaction(base64) {
  if (!base64 || typeof base64 !== 'string') {
    throw new InvalidParameterError('Base64 transaction payload is required');
  }
  const buffer = Buffer.from(base64, 'base64');
  return VersionedTransaction.deserialize(buffer);
}

function isVersionedTransactionPayload(base64) {
  try {
    const buffer = Buffer.from(base64, 'base64');
    return buffer[0] === 0x80 || buffer[0] === 0x81;
  } catch (_error) {
    return false;
  }
}

function deserializeTransaction(base64) {
  if (isVersionedTransactionPayload(base64)) {
    return deserializeVersionedTransaction(base64);
  }
  return deserializeLegacyTransaction(base64);
}

function toBase64(buffer) {
  return Buffer.from(buffer).toString('base64');
}

function fromBase64(value) {
  return Buffer.from(value, 'base64');
}

module.exports = {
  serializeTransaction,
  serializeLegacyTransaction,
  serializeVersionedTransaction,
  deserializeTransaction,
  deserializeLegacyTransaction,
  deserializeVersionedTransaction,
  isVersionedTransactionPayload,
  toBase64,
  fromBase64,
};