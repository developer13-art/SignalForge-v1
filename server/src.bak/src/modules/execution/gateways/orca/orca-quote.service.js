'use strict';

const crypto = require('crypto');

const orcaClient = require('./orca-client.service');
const orcaRepository = require('./orca.repository');
const orcaToken = require('./orca-token.service');

const {
  ORCA_DEFAULT_SLIPPAGE_BPS,
  ORCA_MIN_SLIPPAGE_BPS,
  ORCA_MAX_SLIPPAGE_BPS,
  ORCA_MAX_PRICE_IMPACT_PCT,
  ORCA_MAX_POOLS_PER_QUOTE,
  ORCA_METRICS,
} = require('./orca.constants');

const {
  InvalidRequestError,
  NoRouteFoundError,
  PriceImpactExceededError,
} = require('./orca.errors');

/**
 * SignalForge - Orca Quote Service
 *
 * Fetches, normalizes, and persists Orca quotes. Every quote is
 * persisted so the resulting swap can reference the exact terms the
 * user saw at authorization time.
 */

function generateQuoteId() {
  return `orq_${crypto.randomBytes(10).toString('hex')}`;
}

function validateSlippage(slippageBps) {
  if (slippageBps === undefined || slippageBps === null || slippageBps === '') {
    return ORCA_DEFAULT_SLIPPAGE_BPS;
  }
  const parsed = Number.parseInt(slippageBps, 10);
  if (Number.isNaN(parsed)) {
    throw new InvalidRequestError('slippageBps must be an integer');
  }
  if (parsed < ORCA_MIN_SLIPPAGE_BPS || parsed > ORCA_MAX_SLIPPAGE_BPS) {
    throw new InvalidRequestError(
      `slippageBps must be between ${ORCA_MIN_SLIPPAGE_BPS} and ${ORCA_MAX_SLIPPAGE_BPS}`,
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
  if (!quote) {
    return 0;
  }
  const raw = quote.priceImpactPct ?? quote.priceImpact;
  if (raw === undefined || raw === null) {
    return 0;
  }
  const numeric = Number(raw);
  if (Number.isNaN(numeric)) {
    return 0;
  }
  const asPercent = Math.abs(numeric) > 1 ? Math.abs(numeric) : Math.abs(numeric) * 100;
  return asPercent;
}

function assertPriceImpactWithinLimit({ priceImpactPct, maxPriceImpactPct }) {
  const limit = maxPriceImpactPct || ORCA_MAX_PRICE_IMPACT_PCT;
  if (priceImpactPct > limit) {
    throw new PriceImpactExceededError('Price impact exceeds the configured limit', {
      priceImpactPct,
      limit,
    });
  }
  return priceImpactPct;
}

function normalizeRoutePlan(routePlan) {
  if (!Array.isArray(routePlan)) {
    return [];
  }

  return routePlan.slice(0, ORCA_MAX_POOLS_PER_QUOTE).map((entry) => ({
    whirlpoolAddress: entry.whirlpoolAddress || entry.poolId || null,
    inputMint: entry.inputMint || null,
    outputMint: entry.outputMint || null,
    inAmount: entry.inAmount || null,
    outAmount: entry.outAmount || null,
    feeAmount: entry.feeAmount || null,
    priceImpactPct: computePriceImpactPct(entry),
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

  const effectiveInputMint = inputMint || (await orcaToken.resolveMint(inputSymbol));
  const effectiveOutputMint = outputMint || (await orcaToken.resolveMint(outputSymbol));

  const validatedAmount = validateAmount(amount);
  const validatedSlippage = validateSlippage(slippageBps);

  const response = await orcaClient.fetchQuote({
    inputMint: effectiveInputMint,
    outputMint: effectiveOutputMint,
    amount: validatedAmount,
    slippageBps: validatedSlippage,
  });

  const routePlan = response.routePlan || response.routes || [];
  const normalizedRoutes = normalizeRoutePlan(routePlan);

  if (normalizedRoutes.length === 0) {
    throw new NoRouteFoundError('No Orca route was found for the requested swap', {
      inputMint: effectiveInputMint,
      outputMint: effectiveOutputMint,
    });
  }

  const priceImpactPct = computePriceImpactPct(response);
  assertPriceImpactWithinLimit({ priceImpactPct, maxPriceImpactPct });

  const persisted = await orcaRepository.createQuote(null, {
    id: generateQuoteId(),
    userId: userId || null,
    accountId: accountId || null,
    gateway: 'orca',
    inputMint: effectiveInputMint,
    outputMint: effectiveOutputMint,
    inputSymbol: inputSymbol || null,
    outputSymbol: outputSymbol || null,
    inAmount: response.inAmount || validatedAmount,
    outAmount: response.outAmount,
    minOutAmount: response.otherAmountThreshold || response.minOutAmount || null,
    slippageBps: validatedSlippage,
    priceImpactPct,
    whirlpoolAddress: normalizedRoutes[0]?.whirlpoolAddress || null,
    rawQuote: response,
  });

  return {
    quoteId: persisted.id,
    inputMint: effectiveInputMint,
    outputMint: effectiveOutputMint,
    inputSymbol: inputSymbol || null,
    outputSymbol: outputSymbol || null,
    inAmount: response.inAmount || validatedAmount,
    outAmount: response.outAmount,
    minOutAmount: response.otherAmountThreshold || response.minOutAmount || null,
    slippageBps: validatedSlippage,
    priceImpactPct,
    routes: normalizedRoutes,
    rawQuote: response,
    metric: ORCA_METRICS.QUOTES,
  };
}

async function describeQuote(quoteId) {
  const quote = await orcaRepository.findQuoteById(quoteId);
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
  computePriceImpactPct,
  assertPriceImpactWithinLimit,
  normalizeRoutePlan,
  fetchQuote,
  describeQuote,
};