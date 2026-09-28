'use strict';

const crypto = require('crypto');

const jupiterClient = require('./jupiter-client.service');
const jupiterToken = require('./jupiter-token.service');
const jupiterRepository = require('./jupiter.repository');

const {
  JUPITER_DEFAULT_SLIPPAGE_BPS,
  JUPITER_MIN_SLIPPAGE_BPS,
  JUPITER_MAX_SLIPPAGE_BPS,
  JUPITER_SWAP_MODES,
  JUPITER_MAX_PRICE_IMPACT_PCT,
  JUPITER_METRICS,
} = require('./jupiter.constants');

const {
  InvalidRequestError,
  NoRouteFoundError,
  PriceImpactExceededError,
} = require('./jupiter.errors');

/**
 * SignalForge - Jupiter Quote Service
 *
 * Fetches, validates, and persists Jupiter quotes. Every quote is
 * persisted so that the resulting swap can reference the exact terms
 * the user saw at the moment of authorization.
 */

function generateQuoteId() {
  return `jupq_${crypto.randomBytes(10).toString('hex')}`;
}

function validateSlippage(slippageBps) {
  if (slippageBps === undefined || slippageBps === null || slippageBps === '') {
    return JUPITER_DEFAULT_SLIPPAGE_BPS;
  }
  const parsed = Number.parseInt(slippageBps, 10);
  if (Number.isNaN(parsed)) {
    throw new InvalidRequestError('slippageBps must be an integer');
  }
  if (parsed < JUPITER_MIN_SLIPPAGE_BPS || parsed > JUPITER_MAX_SLIPPAGE_BPS) {
    throw new InvalidRequestError(
      `slippageBps must be between ${JUPITER_MIN_SLIPPAGE_BPS} and ${JUPITER_MAX_SLIPPAGE_BPS}`,
      { slippageBps: parsed },
    );
  }
  return parsed;
}

function validateAmount(amount) {
  const numeric = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new InvalidRequestError('amount must be a positive number', { amount });
  }
  return numeric;
}

function computePriceImpactPct(quote) {
  if (!quote || !quote.priceImpactPct) {
    return 0;
  }
  const parsed = Number(quote.priceImpactPct);
  if (Number.isNaN(parsed)) {
    return 0;
  }
  return Math.abs(parsed) * 100;
}

function assertPriceImpactWithinLimit(quote, maxPriceImpactPct) {
  const impact = computePriceImpactPct(quote);
  const limit = maxPriceImpactPct || JUPITER_MAX_PRICE_IMPACT_PCT;
  if (impact > limit) {
    throw new PriceImpactExceededError('Price impact exceeds the configured limit', {
      priceImpactPct: impact,
      limit,
    });
  }
  return impact;
}

async function fetchQuote({
  inputSymbol,
  outputSymbol,
  inputMint,
  outputMint,
  amount,
  slippageBps,
  swapMode = JUPITER_SWAP_MODES.EXACT_IN,
  userId,
  accountId,
  maxPriceImpactPct,
} = {}) {
  const resolvedInputMint = inputMint || (await jupiterToken.resolveMint(inputSymbol));
  const resolvedOutputMint = outputMint || (await jupiterToken.resolveMint(outputSymbol));

  if (!resolvedInputMint || !resolvedOutputMint) {
    throw new InvalidRequestError('Both input and output tokens are required');
  }

  const validatedAmount = validateAmount(amount);
  const validatedSlippage = validateSlippage(slippageBps);

  const quote = await jupiterClient.fetchQuote({
    inputMint: resolvedInputMint,
    outputMint: resolvedOutputMint,
    amount: validatedAmount,
    slippageBps: validatedSlippage,
    swapMode,
  });

  if (!quote || !quote.routePlan || quote.routePlan.length === 0) {
    throw new NoRouteFoundError('No route was found for the requested swap', {
      inputMint: resolvedInputMint,
      outputMint: resolvedOutputMint,
    });
  }

  const priceImpactPct = assertPriceImpactWithinLimit(quote, maxPriceImpactPct);

  const inputSymbolResolved =
    inputSymbol || (await jupiterToken.resolveSymbol(resolvedInputMint));
  const outputSymbolResolved =
    outputSymbol || (await jupiterToken.resolveSymbol(resolvedOutputMint));

  const persisted = await jupiterRepository.createQuote(null, {
    id: generateQuoteId(),
    userId: userId || null,
    accountId: accountId || null,
    gateway: 'jupiter',
    inputMint: resolvedInputMint,
    outputMint: resolvedOutputMint,
    inputSymbol: inputSymbolResolved || null,
    outputSymbol: outputSymbolResolved || null,
    inAmount: quote.inAmount,
    outAmount: quote.outAmount,
    otherAmountThreshold: quote.otherAmountThreshold,
    slippageBps: validatedSlippage,
    swapMode: quote.swapMode || swapMode,
    priceImpactPct,
    routePlan: quote.routePlan || [],
    rawQuote: quote,
  });

  return {
    quoteId: persisted.id,
    inputMint: resolvedInputMint,
    outputMint: resolvedOutputMint,
    inputSymbol: inputSymbolResolved,
    outputSymbol: outputSymbolResolved,
    inAmount: quote.inAmount,
    outAmount: quote.outAmount,
    otherAmountThreshold: quote.otherAmountThreshold,
    slippageBps: validatedSlippage,
    swapMode: quote.swapMode || swapMode,
    priceImpactPct,
    routePlan: quote.routePlan || [],
    contextSlot: quote.contextSlot || null,
    timeTaken: quote.timeTaken || null,
    rawQuote: quote,
    metric: JUPITER_METRICS.QUOTES,
  };
}

function computeOutAmountForExactOut(quote) {
  if (!quote) {
    return null;
  }
  return quote.outAmount || null;
}

function estimateSlippageAdjustedOutAmount(quote) {
  if (!quote) {
    return null;
  }
  const outAmount = Number(quote.outAmount);
  const threshold = Number(quote.otherAmountThreshold);
  if (!Number.isFinite(outAmount) || !Number.isFinite(threshold)) {
    return null;
  }
  return {
    expected: outAmount,
    minimum: threshold,
    slippage: outAmount - threshold,
  };
}

async function refetchQuote(quoteId) {
  const existing = await jupiterRepository.findQuoteById(quoteId);
  if (!existing) {
    throw new InvalidRequestError('Quote was not found', { quoteId });
  }

  return fetchQuote({
    inputMint: existing.input_mint,
    outputMint: existing.output_mint,
    inputSymbol: existing.input_symbol,
    outputSymbol: existing.output_symbol,
    amount: existing.in_amount,
    slippageBps: existing.slippage_bps,
    swapMode: existing.swap_mode,
    userId: existing.user_id,
    accountId: existing.account_id,
  });
}

module.exports = {
  generateQuoteId,
  validateSlippage,
  validateAmount,
  computePriceImpactPct,
  assertPriceImpactWithinLimit,
  fetchQuote,
  computeOutAmountForExactOut,
  estimateSlippageAdjustedOutAmount,
  refetchQuote,
};