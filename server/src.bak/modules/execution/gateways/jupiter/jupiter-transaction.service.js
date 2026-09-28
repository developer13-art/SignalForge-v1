'use strict';

const { VersionedTransaction } = require('@solana/web3.js');

const jupiterClient = require('./jupiter-client.service');
const jupiterFee = require('./jupiter-fee.service');

const {
  SwapFailedError,
  InvalidRequestError,
} = require('./jupiter.errors');

/**
 * SignalForge - Jupiter Transaction Service
 *
 * Builds signed-ready Jupiter swap transactions. The service never
 * signs transactions on behalf of users; it returns a versioned
 * transaction that the user's wallet must sign.
 */

function decodeBase64(base64) {
  if (!base64 || typeof base64 !== 'string') {
    throw new InvalidRequestError('swapTransaction must be a base64 string');
  }
  return Buffer.from(base64, 'base64');
}

function deserializeVersionedTransaction(base64) {
  const buffer = decodeBase64(base64);
  try {
    return VersionedTransaction.deserialize(buffer);
  } catch (error) {
    throw new SwapFailedError('Failed to deserialize Jupiter swap transaction', {
      reason: error.message,
    });
  }
}

function serializeVersionedTransaction(transaction, { requireAllSignatures = false } = {}) {
  if (!(transaction instanceof VersionedTransaction)) {
    throw new InvalidRequestError('Expected a VersionedTransaction instance');
  }
  const serialized = transaction.serialize({ requireAllSignatures });
  return Buffer.from(serialized).toString('base64');
}

async function buildSwapTransaction({
  quote,
  userPublicKey,
  wrapAndUnwrapSol = true,
  useSharedAccounts = true,
  computeUnitPriceMicroLamports,
  prioritizationFeeLamports,
  dynamicComputeUnitLimit = true,
  asLegacyTransaction = false,
  feeAccount,
}) {
  if (!quote || !quote.rawQuote) {
    throw new InvalidRequestError('A persisted quote is required');
  }

  if (!userPublicKey) {
    throw new InvalidRequestError('userPublicKey is required');
  }

  const resolvedPriorityFee =
    computeUnitPriceMicroLamports !== undefined
      ? computeUnitPriceMicroLamports
      : jupiterFee.resolvePriorityFee({
          policyMicroLamports: computeUnitPriceMicroLamports,
        });

  const swap = await jupiterClient.fetchSwap({
    quoteResponse: quote.rawQuote,
    userPublicKey,
    wrapAndUnwrapSol,
    useSharedAccounts,
    feeAccount: feeAccount || jupiterFee.resolveFeeAccount({}),
    computeUnitPriceMicroLamports: resolvedPriorityFee,
    prioritizationFeeLamports,
    dynamicComputeUnitLimit,
    asLegacyTransaction,
  });

  return {
    swapTransaction: swap.swapTransaction,
    lastValidBlockHeight: swap.lastValidBlockHeight || null,
    prioritizationFeeLamports: resolvedPriorityFee,
    dynamicComputeUnitLimit,
  };
}

async function buildSwapInstructions({
  quote,
  userPublicKey,
  wrapAndUnwrapSol = true,
  useSharedAccounts = true,
  computeUnitPriceMicroLamports,
  feeAccount,
}) {
  if (!quote || !quote.rawQuote) {
    throw new InvalidRequestError('A persisted quote is required');
  }

  if (!userPublicKey) {
    throw new InvalidRequestError('userPublicKey is required');
  }

  const resolvedPriorityFee =
    computeUnitPriceMicroLamports !== undefined
      ? computeUnitPriceMicroLamports
      : jupiterFee.resolvePriorityFee({
          policyMicroLamports: computeUnitPriceMicroLamports,
        });

  const instructions = await jupiterClient.fetchSwapInstructions({
    quoteResponse: quote.rawQuote,
    userPublicKey,
    wrapAndUnwrapSol,
    useSharedAccounts,
    feeAccount: feeAccount || jupiterFee.resolveFeeAccount({}),
    computeUnitPriceMicroLamports: resolvedPriorityFee,
  });

  return {
    instructions,
    prioritizationFeeLamports: resolvedPriorityFee,
  };
}

function buildDeserializedTransaction({ swapTransaction }) {
  return deserializeVersionedTransaction(swapTransaction);
}

function validateUserPublicKey(userPublicKey) {
  if (!userPublicKey || typeof userPublicKey !== 'string') {
    return false;
  }
  return userPublicKey.length >= 32 && userPublicKey.length <= 44;
}

module.exports = {
  decodeBase64,
  deserializeVersionedTransaction,
  serializeVersionedTransaction,
  buildSwapTransaction,
  buildSwapInstructions,
  buildDeserializedTransaction,
  validateUserPublicKey,
};