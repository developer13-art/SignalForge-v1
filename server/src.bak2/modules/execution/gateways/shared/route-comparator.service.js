'use strict';

const {
  SHARED_ERROR_CODES,
} = require('./shared.constants');

const priceImpact = require('./price-impact.service');
const quoteService = require('./quote.service');
const feeService = require('./fee.service');

/**
 * SignalForge - Shared Route Comparator Service
 *
 * Compares candidate routes and quotes across multiple gateways so
 * that the router or a user-facing preview can select the best one
 * according to an explicit strategy. This service is stateless and
 * safe to call from any context.
 */

class RouteComparisonError extends Error {
  constructor(message, code = SHARED_ERROR_CODES.ROUTE_COMPARISON_FAILED) {
    super(message);
    this.name = 'RouteComparisonError';
    this.code = code;
    this.isSharedDexError = true;
  }
}

const STRATEGIES = Object.freeze({
  BEST_RATE: 'best_rate',
  LOWEST_PRICE_IMPACT: 'lowest_price_impact',
  LOWEST_FEE: 'lowest_fee',
  BALANCED: 'balanced',
});

function normalizeCandidate(candidate) {
  if (!candidate) {
    return null;
  }
  const quote = candidate.quote || candidate;
  return {
    gateway: quote.gateway || candidate.gateway,
    inAmount: Number(quote.in_amount || quote.inAmount || 0),
    outAmount: Number(quote.out_amount || quote.outAmount || 0),
    priceImpactPct: priceImpact.normalizeToPercent(
      quote.price_impact_pct || quote.priceImpactPct,
    ),
    slippageBps: Number(quote.slippage_bps || quote.slippageBps || 0),
    platformFeeBps: Number(quote.platform_fee_bps || candidate.platformFeeBps || 0),
    estimatedLamports: Number(candidate.estimatedLamports || 0),
    raw: quote,
  };
}

function computeScore(candidate, { strategy, solPriceUsd } = {}) {
  if (!candidate) {
    return Number.POSITIVE_INFINITY;
  }

  const effectiveRate = candidate.inAmount > 0 ? candidate.outAmount / candidate.inAmount : 0;
  const impact = candidate.priceImpactPct;
  const fee = feeService.computePlatformFee({
    amountUsd: candidate.outAmount,
    gateway: candidate.gateway,
    overrideBps: candidate.platformFeeBps,
  });
  const networkFee = feeService.computeNetworkFee({
    microLamports: 0,
    computeUnits: 0,
  });
  const totalFee = feeService.computeTotalFee({
    platformFeeUsd: fee.feeUsd,
    networkFeeLamports: candidate.estimatedLamports || networkFee.lamports,
    solPriceUsd,
  });

  if (strategy === STRATEGIES.BEST_RATE) {
    return -effectiveRate;
  }

  if (strategy === STRATEGIES.LOWEST_PRICE_IMPACT) {
    return impact;
  }

  if (strategy === STRATEGIES.LOWEST_FEE) {
    return totalFee.totalUsd;
  }

  // Balanced: weight by impact and fee, but keep rate relevance.
  const rateWeight = 1;
  const impactWeight = 2;
  const feeWeight = 1;
  return (
    -effectiveRate * rateWeight +
    impact * impactWeight +
    totalFee.totalUsd * feeWeight
  );
}

function compare({ candidates, strategy = STRATEGIES.BALANCED, solPriceUsd } = {}) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return null;
  }

  const normalized = candidates
    .map(normalizeCandidate)
    .filter((candidate) => candidate && !quoteService.isExpired(candidate.raw));

  if (normalized.length === 0) {
    return null;
  }

  const ranked = normalized
    .map((candidate) => ({
      ...candidate,
      score: computeScore(candidate, { strategy, solPriceUsd }),
    }))
    .sort((a, b) => a.score - b.score);

  return {
    best: ranked[0],
    ranked,
    strategy,
    candidateCount: ranked.length,
  };
}

function compareQuotes({ quotes, strategy = STRATEGIES.BALANCED, solPriceUsd } = {}) {
  if (!Array.isArray(quotes) || quotes.length === 0) {
    return null;
  }
  return compare({
    candidates: quotes.map((quote) => ({ quote })),
    strategy,
    solPriceUsd,
  });
}

function summarizeComparison(comparison) {
  if (!comparison) {
    return null;
  }
  return {
    strategy: comparison.strategy,
    best: {
      gateway: comparison.best.gateway,
      outAmount: comparison.best.outAmount,
      priceImpactPct: comparison.best.priceImpactPct,
    },
    candidates: comparison.ranked.map((entry) => ({
      gateway: entry.gateway,
      outAmount: entry.outAmount,
      priceImpactPct: entry.priceImpactPct,
      score: Number(entry.score.toFixed(6)),
    })),
  };
}

function isSharedDexError(error) {
  return Boolean(error && error.isSharedDexError === true);
}

module.exports = {
  RouteComparisonError,
  STRATEGIES,
  normalizeCandidate,
  computeScore,
  compare,
  compareQuotes,
  summarizeComparison,
  isSharedDexError,
};