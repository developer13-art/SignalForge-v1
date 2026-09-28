'use strict';

const { PublicKey } = require('@solana/web3.js');

const {
  ACTIONS_CHAIN_IDS,
} = require('../actions.constants');

const { config } = require('../actions.config');
const transactionSerializer = require('../builders/transaction-serializer.service');

/**
 * SignalForge - Handler Response Service
 *
 * Normalizes every handler response into the exact envelope expected
 * by the Solana Actions specification. This is the single place where
 * the final transaction payload is validated before being sent to a
 * wallet or X (Twitter) client.
 */

function resolveChainId() {
  const network = String(config.network || 'mainnet-beta').toLowerCase();
  if (network.includes('devnet')) {
    return ACTIONS_CHAIN_IDS.SOLANA_DEVNET;
  }
  if (network.includes('testnet')) {
    return ACTIONS_CHAIN_IDS.SOLANA_TESTNET;
  }
  return ACTIONS_CHAIN_IDS.SOLANA_MAINNET;
}

function isValidBase64(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return false;
  }
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  if (!base64Regex.test(value)) {
    return false;
  }
  try {
    Buffer.from(value, 'base64');
    return true;
  } catch (_error) {
    return false;
  }
}

function assertValidSerializedTransaction(serialized) {
  if (!isValidBase64(serialized)) {
    throw new Error('Handler produced an invalid base64 transaction payload');
  }
}

function buildSuccessResponse({ transaction, message }) {
  assertValidSerializedTransaction(transaction);
  return {
    transaction,
    message: message || 'Complete the transaction in your wallet.',
  };
}

function buildErrorResponse({ message, code }) {
  return {
    message: message || 'The action could not be completed.',
    error: {
      code: code || 'ACTION_FAILED',
    },
  };
}

function buildReferencedResponse({ transaction, message, reference }) {
  assertValidSerializedTransaction(transaction);
  return {
    transaction,
    message: message || 'Complete the transaction in your wallet.',
    reference: reference || null,
  };
}

function withChainContext(response) {
  return {
    ...response,
    chainId: resolveChainId(),
  };
}

function extractReferenceFromTransaction(transaction) {
  if (!transaction) {
    return null;
  }
  const { Transaction, VersionedTransaction } = require('@solana/web3.js');
  if (transaction instanceof VersionedTransaction) {
    const message = transaction.message;
    const accountKeys = message.staticAccountKeys || [];
    for (const key of accountKeys) {
      if (key && typeof key.toBase58 === 'function') {
        const address = key.toBase58();
        if (address.length >= 32 && address.length <= 44) {
          // Reference accounts are indistinguishable from other read-only
          // accounts without additional metadata. Return the first read-only
          // account that is not the payer and not a system program.
          if (address !== '11111111111111111111111111111111') {
            return address;
          }
        }
      }
    }
  } else if (transaction instanceof Transaction) {
    for (const instruction of transaction.instructions) {
      for (const account of instruction.keys) {
        if (account.pubkey && typeof account.pubkey.toBase58 === 'function') {
          const address = account.pubkey.toBase58();
          if (!account.isSigner && !account.isWritable) {
            return address;
          }
        }
      }
    }
  }
  return null;
}

function serializeIfNeeded(transaction) {
  if (typeof transaction === 'string') {
    return transaction;
  }
  return transactionSerializer.serializeTransaction(transaction, {
    requireAllSignatures: false,
  });
}

function buildFromTransactionResult(result, { includeReference = true } = {}) {
  const serialized = serializeIfNeeded(result.transaction);
  assertValidSerializedTransaction(serialized);

  const response = {
    transaction: serialized,
    message: result.message || 'Complete the transaction in your wallet.',
  };

  if (includeReference && result.reference) {
    response.reference = result.reference;
  }

  return response;
}

function validatePublicKey(value, label) {
  try {
    // eslint-disable-next-line no-new
    new PublicKey(value);
    return true;
  } catch (_error) {
    throw new Error(`${label} is not a valid Solana public key`);
  }
}

module.exports = {
  resolveChainId,
  isValidBase64,
  assertValidSerializedTransaction,
  buildSuccessResponse,
  buildErrorResponse,
  buildReferencedResponse,
  withChainContext,
  extractReferenceFromTransaction,
  serializeIfNeeded,
  buildFromTransactionResult,
  validatePublicKey,
};