'use strict';

const crypto = require('crypto');

const jupiterClient = require('./jupiter-client.service');
const jupiterQuote = require('./jupiter-quote.service');
const jupiterSwap = require('./jupiter-transaction.service');
const jupiterSlippage = require('./jupiter-slippage.service');
const jupiterFee = require('./jupiter-fee.service');
const jupiterRoute = require('./jupiter-route.service');
const jupiterToken = require('./jupiter-token.service');
const jupiterRepository = require('./jupiter.repository');
const jupiterConfirmation = require('./jupiter-confirmation.service');

const {
  JUPITER_ERROR_CODES,
  JUPITER_METRICS,
  JUPITER_LOG_CONTEXT,
} = require('./jupiter.constants');

const {
  InvalidRequestError,
  SwapFailedError,
  isJupiterError,
} = require('./jupiter.errors');

/**
 * SignalForge - Jupiter Gateway
 *
 * The Jupiter gateway implements the DEX gateway contract used by the
 * execution router. It exposes quote, swap, confirmation, and
 * reconciliation methods and never signs transactions on behalf of
 * users.
 */

function generateSwapId() {
  return `jups_${crypto.randomBytes(10).toString('hex')}`;
}

function resolveLogger() {
  if (global.__signalforgeLogger && typeof global.__signalforgeLogger.info === 'function') {
    return global.__signalforgeLogger;
  }
  return null;
}

function resolveMetrics() {
  if (global.__signalforgeMetrics && typeof global.__signalforgeMetrics.increment === 'function') {
    return global.__signalforgeMetrics;
  }
  return null;
}

async function quote(params) {
  const started = Date.now();
  const result = await jupiterQuote.fetchQuote(params);
  const elapsed = Date.now() - started;

  const metrics = resolveMetrics();
  if (metrics) {
    metrics.increment(JUPITER_METRICS.QUOTES, { gateway: 'jupiter' });
    metrics.observe?.(JUPITER_METRICS.LATENCY_MS, elapsed, { op: 'quote' });
  }

  return {
    ...result,
    latencyMs: elapsed,
  };
}

async function buildSwap(params) {
  const started = Date.now();

  const { quote: inputQuote, userPublicKey, slippageBps, ...rest } = params;

  if (!inputQuote) {
    throw new InvalidRequestError('A quote is required to build a swap');
  }

  const quoteRecord = inputQuote.quoteId
    ? await jupiterRepository.findQuoteById(inputQuote.quoteId)
    : null;

  const effectiveQuote = quoteRecord
    ? {
        id: quoteRecord.id,
        inputMint: quoteRecord.input_mint,
        outputMint: quoteRecord.output_mint,
        inputSymbol: quoteRecord.input_symbol,
        outputSymbol: quoteRecord.output_symbol,
        inAmount: quoteRecord.in_amount,
        outAmount: quoteRecord.out_amount,
        slippageBps: quoteRecord.slippage_bps,
        priceImpactPct: quoteRecord.price_impact_pct,
        rawQuote: quoteRecord.raw_quote,
      }
    : inputQuote;

  if (!effectiveQuote.rawQuote) {
    throw new InvalidRequestError('The quote does not contain a raw Jupiter payload');
  }

  const resolvedSlippage = jupiterSlippage.validateSlippageValue(
    slippageBps !== undefined ? slippageBps : effectiveQuote.slippageBps,
  );

  const swap = await jupiterSwap.buildSwapTransaction({
    quote: effectiveQuote,
    userPublicKey,
    ...rest,
  });

  const persisted = await jupiterRepository.createSwap(null, {
    id: generateSwapId(),
    quoteId: effectiveQuote.id || null,
    userId: params.userId || null,
    accountId: params.accountId || null,
    gateway: 'jupiter',
    inputMint: effectiveQuote.inputMint,
    outputMint: effectiveQuote.outputMint,
    inAmount: effectiveQuote.inAmount,
    outAmount: effectiveQuote.outAmount,
    slippageBps: resolvedSlippage,
    priceImpactPct: effectiveQuote.priceImpactPct,
    transactionSignature: null,
    status: 'pending',
    rawResponse: swap,
  });

  const elapsed = Date.now() - started;

  const metrics = resolveMetrics();
  if (metrics) {
    metrics.increment(JUPITER_METRICS.SWAPS, { gateway: 'jupiter' });
    metrics.observe?.(JUPITER_METRICS.LATENCY_MS, elapsed, { op: 'swap' });
  }

  const logger = resolveLogger();
  if (logger) {
    logger.info(
      {
        context: JUPITER_LOG_CONTEXT,
        swapId: persisted.id,
        inputMint: effectiveQuote.inputMint,
        outputMint: effectiveQuote.outputMint,
        latencyMs: elapsed,
      },
      'Jupiter swap built',
    );
  }

  return {
    swapId: persisted.id,
    quoteId: effectiveQuote.id || null,
    swapTransaction: swap.swapTransaction,
    lastValidBlockHeight: swap.lastValidBlockHeight,
    prioritizationFeeLamports: swap.prioritizationFeeLamports,
    slippageBps: resolvedSlippage,
    priceImpactPct: effectiveQuote.priceImpactPct,
    inAmount: effectiveQuote.inAmount,
    outAmount: effectiveQuote.outAmount,
    latencyMs: elapsed,
  };
}

async function submit({ swapId, signature }) {
  if (!swapId) {
    throw new InvalidRequestError('swapId is required');
  }
  if (!signature) {
    throw new InvalidRequestError('signature is required');
  }

  const updated = await jupiterRepository.updateSwapStatus(swapId, {
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

async function confirm({ swapId, signature }) {
  return jupiterConfirmation.confirmSwap({ swapId, signature });
}

async function reconcile(params) {
  return jupiterConfirmation.reconcile(params);
}

async function fetchQuote(params) {
  return jupiterQuote.fetchQuote(params);
}

async function fetchRouteSummary(routePlan) {
  return jupiterRoute.summarizeRoute(routePlan);
}

async function resolveToken(symbol) {
  return jupiterToken.resolveMint(symbol);
}

async function resolveSymbol(mint) {
  return jupiterToken.resolveSymbol(mint);
}

async function listSupportedTokens() {
  return jupiterToken.listSupportedTokens();
}

function resolveSlippage(params) {
  return jupiterSlippage.resolveSlippage(params);
}

function describeFees(params) {
  return jupiterFee.describeFeeEstimate(params);
}

async function health() {
  try {
    const baseUrl = jupiterClient.resolveBaseUrl();
    return {
      gateway: 'jupiter',
      status: 'ok',
      baseUrl,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      gateway: 'jupiter',
      status: 'error',
      reason: error.message,
      checkedAt: new Date().toISOString(),
    };
  }
}

function isError(error) {
  return isJupiterError(error);
}

module.exports = {
  quote,
  buildSwap,
  submit,
  confirm,
  reconcile,
  fetchQuote,
  fetchRouteSummary,
  resolveToken,
  resolveSymbol,
  listSupportedTokens,
  resolveSlippage,
  describeFees,
  health,
  isError,
  generateSwapId,
  ERROR_CODES: JUPITER_ERROR_CODES,
};