'use strict';

const crypto = require('crypto');

const {
  QUOTE_STATUSES,
  SHARED_DEFAULTS,
  SHARED_ERROR_CODES,
  SHARED_METRICS,
} = require('./shared.constants');

/**
 * SignalForge - Shared Quote Service
 *
 * Gateway-neutral quote lifecycle management. Gateways delegate quote
 * persistence, freshness checks, and consumption to this service so
 * the same rules apply everywhere.
 */

class QuoteError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'QuoteError';
    this.code = code;
    this.isSharedDexError = true;
  }
}

function generateQuoteId(prefix = 'quote') {
  return `${prefix}_${crypto.randomBytes(10).toString('hex')}`;
}

function resolveTtlSeconds(ttlSeconds) {
  if (Number.isFinite(Number(ttlSeconds))) {
    return Math.max(1, Number(ttlSeconds));
  }
  return SHARED_DEFAULTS.QUOTE_TTL_SECONDS;
}

function computeExpiry({ createdAt, ttlSeconds } = {}) {
  const base = createdAt ? new Date(createdAt).getTime() : Date.now();
  const ttl = resolveTtlSeconds(ttlSeconds);
  return new Date(base + ttl * 1000).toISOString();
}

function isExpired(quote) {
  if (!quote || !quote.expires_at) {
    return false;
  }
  return Date.now() > new Date(quote.expires_at).getTime();
}

function assertNotExpired(quote) {
  if (isExpired(quote)) {
    throw new QuoteError('Quote has expired', SHARED_ERROR_CODES.QUOTE_EXPIRED);
  }
  return true;
}

function assertNotConsumed(quote) {
  if (quote && quote.status === QUOTE_STATUSES.CONSUMED) {
    throw new QuoteError('Quote has already been consumed', SHARED_ERROR_CODES.QUOTE_ALREADY_CONSUMED);
  }
  return true;
}

function assertUsable(quote) {
  if (!quote) {
    throw new QuoteError('Quote was not found', SHARED_ERROR_CODES.QUOTE_NOT_FOUND);
  }
  assertNotExpired(quote);
  assertNotConsumed(quote);
  return true;
}

function describeQuote(quote) {
  if (!quote) {
    return null;
  }
  return {
    id: quote.id,
    gateway: quote.gateway,
    inputMint: quote.input_mint || quote.inputMint,
    outputMint: quote.output_mint || quote.outputMint,
    inputSymbol: quote.input_symbol || quote.inputSymbol,
    outputSymbol: quote.output_symbol || quote.outputSymbol,
    inAmount: quote.in_amount || quote.inAmount,
    outAmount: quote.out_amount || quote.outAmount,
    minOutAmount: quote.min_out_amount || quote.minOutAmount,
    slippageBps: quote.slippage_bps || quote.slippageBps,
    priceImpactPct: quote.price_impact_pct || quote.priceImpactPct,
    status: quote.status,
    expiresAt: quote.expires_at || quote.expiresAt,
    createdAt: quote.created_at || quote.createdAt,
  };
}

function buildQuoteRecord({
  id,
  gateway,
  userId,
  accountId,
  inputMint,
  outputMint,
  inputSymbol,
  outputSymbol,
  inAmount,
  outAmount,
  minOutAmount,
  slippageBps,
  priceImpactPct,
  rawQuote,
  ttlSeconds,
}) {
  const createdAt = new Date().toISOString();
  return {
    id: id || generateQuoteId(),
    gateway,
    user_id: userId || null,
    account_id: accountId || null,
    input_mint: inputMint,
    output_mint: outputMint,
    input_symbol: inputSymbol || null,
    output_symbol: outputSymbol || null,
    in_amount: inAmount,
    out_amount: outAmount,
    min_out_amount: minOutAmount || null,
    slippage_bps: slippageBps,
    price_impact_pct: priceImpactPct || null,
    status: QUOTE_STATUSES.FRESH,
    expires_at: computeExpiry({ createdAt, ttlSeconds }),
    raw_quote: rawQuote,
    created_at: createdAt,
  };
}

function summarizeQuoteForComparison(quote) {
  return {
    gateway: quote.gateway,
    inAmount: Number(quote.in_amount || quote.inAmount || 0),
    outAmount: Number(quote.out_amount || quote.outAmount || 0),
    priceImpactPct: Number(quote.price_impact_pct || quote.priceImpactPct || 0),
    slippageBps: Number(quote.slippage_bps || quote.slippageBps || 0),
  };
}

function computeEffectiveRate(quote) {
  const inAmount = Number(quote.in_amount || quote.inAmount || 0);
  const outAmount = Number(quote.out_amount || quote.outAmount || 0);
  if (inAmount <= 0) {
    return null;
  }
  return outAmount / inAmount;
}

function selectBestQuote(quotes, { strategy = 'best_rate' } = {}) {
  if (!Array.isArray(quotes) || quotes.length === 0) {
    return null;
  }

  const valid = quotes.filter((quote) => quote && !isExpired(quote));
  if (valid.length === 0) {
    return null;
  }

  if (strategy === 'lowest_price_impact') {
    return valid.reduce((best, current) =>
      Number(current.price_impact_pct || current.priceImpactPct || Infinity) <
      Number(best.price_impact_pct || best.priceImpactPct || Infinity)
        ? current
        : best,
    );
  }

  if (strategy === 'best_rate') {
    return valid.reduce((best, current) => {
      const bestRate = computeEffectiveRate(best);
      const currentRate = computeEffectiveRate(current);
      if (bestRate === null) {
        return current;
      }
      if (currentRate === null) {
        return best;
      }
      return currentRate > bestRate ? current : best;
    });
  }

  return valid[0];
}

module.exports = {
  QuoteError,
  generateQuoteId,
  resolveTtlSeconds,
  computeExpiry,
  isExpired,
  assertNotExpired,
  assertNotConsumed,
  assertUsable,
  describeQuote,
  buildQuoteRecord,
  summarizeQuoteForComparison,
  computeEffectiveRate,
  selectBestQuote,
  QUOTE_STATUSES,
  METRICS: SHARED_METRICS,
};