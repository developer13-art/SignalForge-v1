'use strict';

const crypto = require('crypto');

const raydiumClient = require('./raydium-client.service');
const raydiumRepository = require('./raydium.repository');
const raydiumQuote = require('./raydium-quote.service');

const {
  RAYDIUM_DEFAULT_PRIORITY_FEE_MICRO_LAMPORTS,
  RAYDIUM_DEFAULT_TX_VERSION,
  RAYDIUM_METRICS,
} = require('./raydium.constants');

const {
  InvalidRequestError,
  SwapFailedError,
} = require('./raydium.errors');

/**
 * SignalForge - Raydium Swap Service
 *
 * Builds and submits Raydium swap transactions. The service never
 * signs on behalf of users; it returns a versioned transaction (or a
 * list of them) that the user's wallet must sign.
 */

function generateSwapId() {
  return `rays_${crypto.randomBytes(10).toString('hex')}`;
}

function resolvePriorityFee(computeUnitPriceMicroLamports) {
  if (
    computeUnitPriceMicroLamports !== undefined &&
    computeUnitPriceMicroLamports !== null &&
    Number.isFinite(Number(computeUnitPriceMicroLamports))
  ) {
    return Number(computeUnitPriceMicroLamports);
  }
  return RAYDIUM_DEFAULT_PRIORITY_FEE_MICRO_LAMPORTS;
}

function normalizeTransactionResponse(response) {
  if (!response || !response.data) {
    throw new SwapFailedError('Raydium returned an empty transaction');
  }
  const data = Array.isArray(response.data) ? response.data : [response.data];

  return data.map((entry) => ({
    transaction: entry.transaction || entry.swapTransaction || null,
    version: entry.version || RAYDIUM_DEFAULT_TX_VERSION,
    lastValidBlockHeight: entry.lastValidBlockHeight || null,
    innerTransactions: entry.innerTransactions || null,
    signers: entry.signers || null,
    addressLookupTableAddresses: entry.addressLookupTableAddresses || null,
  }));
}

async function buildSwap({
  quote,
  wallet,
  computeUnitPriceMicroLamports,
  txVersion = RAYDIUM_DEFAULT_TX_VERSION,
  wrapSol = true,
  unwrapSol = true,
  userId,
  accountId,
  feeAccount,
} = {}) {
  if (!quote) {
    throw new InvalidRequestError('A persisted quote is required');
  }
  if (!wallet) {
    throw new InvalidRequestError('wallet is required');
  }

  const rawQuote = quote.rawQuote || quote.raw_quote;
  if (!rawQuote) {
    throw new InvalidRequestError('The quote does not contain a raw Raydium payload');
  }

  const priorityFee = resolvePriorityFee(computeUnitPriceMicroLamports);

  const response = await raydiumClient.buildSwapTransaction({
    computeUnitPriceMicroLamports: priorityFee,
    swapResponse: rawQuote,
    wallet,
    txVersion,
    wrapSol,
    unwrapSol,
    feeAccount,
  });

  const transactions = normalizeTransactionResponse(response);

  const persisted = await raydiumRepository.createSwap(null, {
    id: generateSwapId(),
    quoteId: quote.id || quote.quoteId || null,
    userId: userId || null,
    accountId: accountId || null,
    gateway: 'raydium',
    inputMint: quote.inputMint || quote.input_mint,
    outputMint: quote.outputMint || quote.output_mint,
    inAmount: quote.inAmount || quote.in_amount,
    outAmount: quote.outAmount || quote.out_amount,
    slippageBps: quote.slippageBps || quote.slippage_bps,
    priceImpactPct: quote.priceImpactPct || quote.price_impact_pct,
    status: 'pending',
    rawResponse: response,
  });

  return {
    swapId: persisted.id,
    quoteId: persisted.quote_id,
    transactions,
    priorityFeeMicroLamports: priorityFee,
    txVersion,
    metric: RAYDIUM_METRICS.SWAPS,
  };
}

async function submit({ swapId, signature } = {}) {
  if (!swapId) {
    throw new InvalidRequestError('swapId is required');
  }
  if (!signature) {
    throw new InvalidRequestError('signature is required');
  }

  const updated = await raydiumRepository.updateSwapStatus(swapId, {
    status: 'submitted',
    transactionSignature: signature,
    submittedAt: new Date().toISOString(),
  });

  if (!updated) {
    throw new SwapFailedError('Swap record was not found', { swapId });
  }

  return {
    swapId,
    signature,
    status: 'submitted',
    record: updated,
  };
}

async function confirm({ swapId, signature } = {}) {
  const confirmationService = require('./raydium-confirmation.service');
  return confirmationService.confirmSwap({ swapId, signature });
}

async function reconcile(params) {
  const confirmationService = require('./raydium-confirmation.service');
  return confirmationService.reconcile(params);
}

async function listSwaps({ userId, status, page, pageSize } = {}) {
  return raydiumRepository.listSwaps({ userId, status, page, pageSize });
}

async function getSwap(swapId) {
  const swap = await raydiumRepository.findSwapById(swapId);
  if (!swap) {
    throw new SwapFailedError('Swap record was not found', { swapId });
  }
  return swap;
}

async function refetchQuote(quoteId) {
  return raydiumQuote.describeQuote(quoteId);
}

module.exports = {
  generateSwapId,
  resolvePriorityFee,
  normalizeTransactionResponse,
  buildSwap,
  submit,
  confirm,
  reconcile,
  listSwaps,
  getSwap,
  refetchQuote,
};