'use strict';

const crypto = require('crypto');

const orcaClient = require('./orca-client.service');
const orcaRepository = require('./orca.repository');

const {
  ORCA_DEFAULT_PRIORITY_FEE_MICRO_LAMPORTS,
  ORCA_DEFAULT_TX_VERSION,
  ORCA_METRICS,
} = require('./orca.constants');

const {
  InvalidRequestError,
  SwapFailedError,
} = require('./orca.errors');

/**
 * SignalForge - Orca Swap Service
 *
 * Builds and submits Orca swap transactions. The service never signs
 * on behalf of users.
 */

function generateSwapId() {
  return `ors_${crypto.randomBytes(10).toString('hex')}`;
}

function resolvePriorityFee(computeUnitPriceMicroLamports) {
  if (
    computeUnitPriceMicroLamports !== undefined &&
    computeUnitPriceMicroLamports !== null &&
    Number.isFinite(Number(computeUnitPriceMicroLamports))
  ) {
    return Number(computeUnitPriceMicroLamports);
  }
  return ORCA_DEFAULT_PRIORITY_FEE_MICRO_LAMPORTS;
}

function normalizeTransactionResponse(response) {
  if (!response || !response.transaction) {
    throw new SwapFailedError('Orca returned an empty transaction');
  }
  return {
    transaction: response.transaction,
    lastValidBlockHeight: response.lastValidBlockHeight || null,
    version: response.version || ORCA_DEFAULT_TX_VERSION,
  };
}

async function buildSwap({
  quote,
  wallet,
  computeUnitPriceMicroLamports,
  wrapAndUnwrapSol = true,
  userId,
  accountId,
} = {}) {
  if (!quote) {
    throw new InvalidRequestError('A persisted quote is required');
  }
  if (!wallet) {
    throw new InvalidRequestError('wallet is required');
  }

  const rawQuote = quote.rawQuote || quote.raw_quote;
  if (!rawQuote) {
    throw new InvalidRequestError('The quote does not contain a raw Orca payload');
  }

  const priorityFee = resolvePriorityFee(computeUnitPriceMicroLamports);

  const response = await orcaClient.fetchSwap({
    quoteResponse: rawQuote,
    userPublicKey: wallet,
    wrapAndUnwrapSol,
    computeUnitPriceMicroLamports: priorityFee,
  });

  const transaction = normalizeTransactionResponse(response);

  const persisted = await orcaRepository.createSwap(null, {
    id: generateSwapId(),
    quoteId: quote.id || quote.quoteId || null,
    userId: userId || null,
    accountId: accountId || null,
    gateway: 'orca',
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
    transaction,
    priorityFeeMicroLamports: priorityFee,
    metric: ORCA_METRICS.SWAPS,
  };
}

async function submit({ swapId, signature } = {}) {
  if (!swapId) {
    throw new InvalidRequestError('swapId is required');
  }
  if (!signature) {
    throw new InvalidRequestError('signature is required');
  }

  const updated = await orcaRepository.updateSwapStatus(swapId, {
    status: 'submitted',
    transactionSignature: signature,
    submittedAt: new Date().toISOString(),
  });

  if (!updated) {
    throw new SwapFailedError('Swap record was not found', { swapId });
  }

  return { swapId, signature, status: 'submitted', record: updated };
}

async function confirm({ swapId, signature } = {}) {
  const confirmationService = require('./orca-confirmation.service');
  return confirmationService.confirmSwap({ swapId, signature });
}

async function reconcile(params) {
  const confirmationService = require('./orca-confirmation.service');
  return confirmationService.reconcile(params);
}

async function listSwaps({ userId, status, page, pageSize } = {}) {
  return orcaRepository.listSwaps({ userId, status, page, pageSize });
}

async function getSwap(swapId) {
  const swap = await orcaRepository.findSwapById(swapId);
  if (!swap) {
    throw new SwapFailedError('Swap record was not found', { swapId });
  }
  return swap;
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
};