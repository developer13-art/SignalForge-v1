'use strict';

const crypto = require('crypto');

const raydiumClient = require('./raydium-client.service');
const raydiumPool = require('./raydium-pool.service');
const raydiumRepository = require('./raydium.repository');

const {
  RAYDIUM_DEFAULT_SLIPPAGE_BPS,
  RAYDIUM_MIN_SLIPPAGE_BPS,
  RAYDIUM_MAX_SLIPPAGE_BPS,
  RAYDIUM_MAX_POOLS_PER_QUOTE,
  RAYDIUM_MAX_PRICE_IMPACT_PCT,
  RAYDIUM_METRICS,
} = require('./raydium.constants');

const {
  InvalidRequestError,
  NoRouteFoundError,
  PriceImpactExceededError,
} = require('./raydium.errors');

/**
 * SignalForge - Raydium Quote Service
 *
 * Fetches and normalizes Raydium swap quotes. Raydium returns quotes
 * per route; the service flattens this into a single, gateway-neutral
 * shape that the execution router can consume.
 */

function generateQuoteId() {
  return `rayq_${crypto.randomBytes(10).toString('hex')}`;
}

function validateSlippage(slippageBps) {
  if (slippageBps === undefined || slippageBps === null || slippageBps === '') {
    return RAYDIUM_DEFAULT_SLIPPAGE_BPS;
  }
  const parsed = Number.parseInt(slippageBps, 10);
  if (Number.isNaN(parsed)) {
    throw new InvalidRequestError('slippageBps must be an integer');
  }
  if (parsed < RAYDIUM_MIN_SLIPPAGE_BPS || parsed > RAYDIUM_MAX_SLIPPAGE_BPS) {
    throw new InvalidRequestError(
      `slippageBps must be between ${RAYDIUM_MIN_SLIPPAGE_BPS} and ${RAYDIUM_MAX_SLIPPAGE_BPS}`,
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

function computePriceImpactPercent(entry) {
  if (!entry) {
    return 0;
  }
  const raw = entry.priceImpact;
  if (raw === undefined || raw === null) {
    return 0;
  }
  const numeric = Number(raw);
  if (Number.isNaN(numeric)) {
    return 0;
  }
  return Math.abs(numeric) * 100;
}

function assertPriceImpactWithinLimit({ priceImpactPct, maxPriceImpactPct }) {
  const limit = maxPriceImpactPct || RAYDIUM_MAX_PRICE_IMPACT_PCT;
  if (priceImpactPct > limit) {
    throw new PriceImpactExceededError('Price impact exceeds the configured limit', {
      priceImpactPct,
      limit,
    });
  }
  return priceImpactPct;
}

function pickBestRoute(routes) {
  if (!Array.isArray(routes) || routes.length === 0) {
    return null;
  }

  const sorted = [...routes].sort((a, b) => {
    const aImpact = computePriceImpactPercent(a);
    const bImpact = computePriceImpactPercent(b);
    if (aImpact !== bImpact) {
      return aImpact - bImpact;
    }
    return Number(b.outputAmount || 0) - Number(a.outputAmount || 0);
  });

  return sorted[0];
}

function summarizeRoutes(routes) {
  if (!Array.isArray(routes)) {
    return [];
  }

  return routes.map((entry) => ({
    poolId: entry.poolId || entry.ammId || null,
    poolType: entry.poolType || null,
    inputMint: entry.inputMint || null,
    outputMint: entry.outputMint || null,
    inputAmount: entry.inputAmount || null,
    outputAmount: entry.outputAmount || null,
    minOutputAmount: entry.otherAmountThreshold || entry.minOutputAmount || null,
    priceImpactPct: computePriceImpactPercent(entry),
    feeAmount: entry.feeAmount || null,
  }));
}

async function fetchQuote({
  inputSymbol,
  outputSymbol,
  inputMint,
  outputMint,
  amount,
  slippageBps,
  userId,
  accountId,
  maxPriceImpactPct,
} = {}) {
  if (!inputMint && !inputSymbol) {
    throw new InvalidRequestError('inputMint or inputSymbol is required');
  }
  if (!outputMint && !outputSymbol) {
    throw new InvalidRequestError('outputMint or outputSymbol is required');
  }

  const effectiveInputMint = inputMint || (await resolveSymbolToMint(inputSymbol));
  const effectiveOutputMint = outputMint || (await resolveSymbolToMint(outputSymbol));

  const validatedAmount = validateAmount(amount);
  const validatedSlippage = validateSlippage(slippageBps);

  const response = await raydiumClient.computeSwapBaseIn({
    inputMint: effectiveInputMint,
    outputMint: effectiveOutputMint,
    amount: validatedAmount,
    slippageBps: validatedSlippage,
  });

  const routes = response.data || [];
  const best = pickBestRoute(routes);

  if (!best) {
    throw new NoRouteFoundError('No Raydium route was found for the requested swap', {
      inputMint: effectiveInputMint,
      outputMint: effectiveOutputMint,
    });
  }

  const priceImpactPct = computePriceImpactPercent(best);
  assertPriceImpactWithinLimit({ priceImpactPct, maxPriceImpactPct });

  const summarizedRoutes = summarizeRoutes(routes).slice(0, RAYDIUM_MAX_POOLS_PER_QUOTE);

  const persisted = await raydiumRepository.createQuote(null, {
    id: generateQuoteId(),
    userId: userId || null,
    accountId: accountId || null,
    gateway: 'raydium',
    inputMint: effectiveInputMint,
    outputMint: effectiveOutputMint,
    inputSymbol: inputSymbol || null,
    outputSymbol: outputSymbol || null,
    inAmount: best.inputAmount || validatedAmount,
    outAmount: best.outputAmount,
    minOutAmount: best.otherAmountThreshold || best.minOutputAmount || null,
    slippageBps: validatedSlippage,
    priceImpactPct,
    poolIds: summarizedRoutes.map((route) => route.poolId).filter(Boolean),
    rawQuote: response,
  });

  return {
    quoteId: persisted.id,
    inputMint: effectiveInputMint,
    outputMint: effectiveOutputMint,
    inputSymbol: inputSymbol || null,
    outputSymbol: outputSymbol || null,
    inAmount: best.inputAmount || validatedAmount,
    outAmount: best.outputAmount,
    minOutAmount: best.otherAmountThreshold || best.minOutputAmount || null,
    slippageBps: validatedSlippage,
    priceImpactPct,
    routes: summarizedRoutes,
    rawQuote: response,
    metric: RAYDIUM_METRICS.QUOTES,
  };
}

async function resolveSymbolToMint(symbol) {
  const tokenService = require('./raydium-token.service');
  return tokenService.resolveMint(symbol);
}

async function computeSwapBaseOut({
  inputMint,
  outputMint,
  amount,
  slippageBps,
} = {}) {
  if (!inputMint || !outputMint) {
    throw new InvalidRequestError('inputMint and outputMint are required');
  }
  const validatedAmount = validateAmount(amount);
  const validatedSlippage = validateSlippage(slippageBps);

  const response = await raydiumClient.computeSwapBaseOut({
    inputMint,
    outputMint,
    amount: validatedAmount,
    slippageBps: validatedSlippage,
  });

  return response.data || [];
}

async function describeQuote(quoteId) {
  const quote = await raydiumRepository.findQuoteById(quoteId);
  if (!quote) {
    throw new InvalidRequestError('Quote was not found', { quoteId });
  }
  return {
    quoteId: quote.id,
    inputMint: quote.input_mint,
    outputMint: quote.output_mint,
    inAmount: quote.in_amount,
    outAmount: quote.out_amount,
    minOutAmount: quote.min_out_amount,
    slippageBps: quote.slippage_bps,
    priceImpactPct: quote.price_impact_pct,
  };
}

module.exports = {
  generateQuoteId,
  validateSlippage,
  validateAmount,
  computePriceImpactPercent,
  assertPriceImpactWithinLimit,
  pickBestRoute,
  summarizeRoutes,
  fetchQuote,
  computeSwapBaseOut,
  describeQuote,
};