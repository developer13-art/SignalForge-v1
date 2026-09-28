'use strict';

const crypto = require('crypto');

const priceFeedRepository = require('./price-feed.repository');
const marketDataCache = require('./market-data-cache.service');
const cryptoSymbol = require('../../signals/crypto/crypto-symbol.service');

const {
  MARKET_DATA_SOURCES,
  MARKET_DATA_SOURCE_PRIORITY,
  PRICE_FEED_STATUSES,
  MARKET_DATA_DEFAULTS,
  MARKET_DATA_MAX_STALE_SECONDS,
  MARKET_DATA_MAX_PRICE_DEVIATION_PCT,
  MARKET_DATA_METRICS,
} = require('./market-data.constants');

const {
  InvalidRequestError,
  PriceNotFoundError,
  PriceStaleError,
  PriceDivergenceError,
  SourceUnavailableError,
} = require('./market-data.errors');

/**
 * SignalForge - Price Feed Service
 *
 * Provides spot prices for crypto pairs. Prices are sourced from
 * multiple providers; the service normalizes them, persists snapshots,
 * and returns a canonical answer to consumers. It never returns an
 * unverified price; when sources disagree beyond the configured
 * threshold, the service raises a divergence error.
 */

const CACHE_NAMESPACE = 'crypto-price';

function generateSnapshotId() {
  return `cpx_${crypto.randomBytes(10).toString('hex')}`;
}

function normalizePrice(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }
  return numeric;
}

function computeMedian(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function computeDeviationPercent(values) {
  if (!Array.isArray(values) || values.length < 2) {
    return 0;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const median = computeMedian(values);
  if (!median || median === 0) {
    return 0;
  }
  return ((max - min) / median) * 100;
}

async function fetchFromJupiter(canonicalSymbol) {
  const jupiter = require('../../execution/gateways/jupiter');
  const [base, rest] = canonicalSymbol.split('/');
  const [quote] = (rest || '').split('-');
  const quoteMint = await jupiter.gateway.resolveToken(quote);
  const priceData = await jupiter.client.fetchPrices({
    mints: [quoteMint],
  });
  void base;
  const entry = priceData[quoteMint];
  if (!entry || !entry.price) {
    return null;
  }
  return normalizePrice(entry.price);
}

async function fetchFromRaydium(canonicalSymbol) {
  const raydium = require('../../execution/gateways/raydium');
  try {
    const [base, rest] = canonicalSymbol.split('/');
    const [quote] = (rest || '').split('-');
    const baseMint = await raydium.gateway.resolveToken(base);
    const quoteMint = await raydium.gateway.resolveToken(quote);
    const pools = await raydium.pool.findPoolByMints({ baseMint, quoteMint });
    if (!pools || !pools.price) {
      return null;
    }
    return normalizePrice(pools.price);
  } catch (_error) {
    return null;
  }
}

async function fetchFromOrca(canonicalSymbol) {
  const orca = require('../../execution/gateways/orca');
  try {
    const [base, rest] = canonicalSymbol.split('/');
    const [quote] = (rest || '').split('-');
    const baseMint = await orca.gateway.resolveToken(base);
    const quoteMint = await orca.gateway.resolveToken(quote);
    const pools = await orca.pool.findPoolByMints({ baseMint, quoteMint });
    if (!pools || !pools.price) {
      return null;
    }
    return normalizePrice(pools.price);
  } catch (_error) {
    return null;
  }
}

const SOURCE_FETCHERS = Object.freeze({
  [MARKET_DATA_SOURCES.JUPITER]: fetchFromJupiter,
  [MARKET_DATA_SOURCES.RAYDIUM]: fetchFromRaydium,
  [MARKET_DATA_SOURCES.ORCA]: fetchFromOrca,
});

async function fetchFromSources(canonicalSymbol, sources) {
  const results = await Promise.all(
    sources.map(async (source) => {
      const fetcher = SOURCE_FETCHERS[source];
      if (!fetcher) {
        return null;
      }
      try {
        const price = await fetcher(canonicalSymbol);
        if (price === null) {
          return null;
        }
        return { source, price };
      } catch (_error) {
        if (global.__signalforgeMetrics) {
          global.__signalforgeMetrics.increment(MARKET_DATA_METRICS.SOURCE_FAILURES, { source });
        }
        return null;
      }
    }),
  );
  return results.filter(Boolean);
}

function selectSources({ preferred, maxSources }) {
  const all = [...MARKET_DATA_SOURCES.JUPITER, MARKET_DATA_SOURCES.RAYDIUM, MARKET_DATA_SOURCES.ORCA];
  if (preferred && all.includes(preferred)) {
    return [preferred, ...all.filter((source) => source !== preferred)].slice(
      0,
      maxSources || MARKET_DATA_DEFAULTS.MAX_SOURCES_PER_LOOKUP,
    );
  }
  return all.slice(0, maxSources || MARKET_DATA_DEFAULTS.MAX_SOURCES_PER_LOOKUP);
}

async function fetchPrice({ symbol, preferredSource, maxSources, persist = true } = {}) {
  if (!symbol) {
    throw new InvalidRequestError('symbol is required');
  }

  const normalized = await cryptoSymbol.normalizeSymbol(symbol);
  const canonicalSymbol = normalized.canonicalSymbol;

  const cacheKey = `${canonicalSymbol}`;

  return marketDataCache.getOrSet(
    CACHE_NAMESPACE,
    cacheKey,
    async () => {
      const sources = selectSources({ preferred: preferredSource, maxSources });
      const results = await fetchFromSources(canonicalSymbol, sources);

      if (results.length === 0) {
        const persisted = await priceFeedRepository.findLatest(canonicalSymbol);
        if (persisted) {
          return {
            canonicalSymbol,
            price: Number(persisted.price),
            source: persisted.source,
            sourceSymbol: persisted.source_symbol,
            fetchedAt: persisted.fetched_at,
            status: PRICE_FEED_STATUSES.STALE,
            stale: true,
          };
        }
        throw new PriceNotFoundError(`No price available for ${canonicalSymbol}`, {
          canonicalSymbol,
        });
      }

      const prices = results.map((entry) => entry.price);
      const deviation = computeDeviationPercent(prices);

      if (deviation > MARKET_DATA_MAX_PRICE_DEVIATION_PCT) {
        throw new PriceDivergenceError('Sources diverge beyond the allowed threshold', {
          canonicalSymbol,
          deviation,
          limit: MARKET_DATA_MAX_PRICE_DEVIATION_PCT,
          results,
        });
      }

      const median = computeMedian(prices);
      const best = results.reduce((winner, current) =>
        MARKET_DATA_SOURCE_PRIORITY[current.source] > MARKET_DATA_SOURCE_PRIORITY[winner.source]
          ? current
          : winner,
      );

      const result = {
        canonicalSymbol,
        price: median,
        source: best.source,
        sourceSymbol: best.source,
        sourcesSampled: results.length,
        deviationPct: Math.round(deviation * 100) / 100,
        fetchedAt: new Date().toISOString(),
        status: PRICE_FEED_STATUSES.FRESH,
        stale: false,
      };

      if (persist) {
        try {
          await priceFeedRepository.insertSnapshot(null, {
            id: generateSnapshotId(),
            canonicalSymbol,
            baseAsset: normalized.baseAsset,
            quoteAsset: normalized.quoteAsset,
            price: result.price,
            source: result.source,
            sourceSymbol: result.sourceSymbol,
            metadata: {
              sourcesSampled: results.length,
              deviationPct: result.deviationPct,
            },
          });
          await priceFeedRepository.upsertLatest(null, {
            canonicalSymbol,
            baseAsset: normalized.baseAsset,
            quoteAsset: normalized.quoteAsset,
            price: result.price,
            source: result.source,
            sourceSymbol: result.sourceSymbol,
            metadata: {
              sourcesSampled: results.length,
              deviationPct: result.deviationPct,
            },
          });
        } catch (_error) {
          // Persistence failures do not affect pricing result.
        }
      }

      return result;
    },
    { ttlSeconds: MARKET_DATA_DEFAULTS.PRICE_TTL_SECONDS },
  );
}

async function fetchPriceBatch({ symbols, preferredSource } = {}) {
  if (!Array.isArray(symbols) || symbols.length === 0) {
    throw new InvalidRequestError('symbols must be a non-empty array');
  }
  if (symbols.length > MARKET_DATA_DEFAULTS.PRICE_BATCH_SIZE) {
    throw new InvalidRequestError(
      `symbols must not exceed ${MARKET_DATA_DEFAULTS.PRICE_BATCH_SIZE} entries`,
    );
  }

  const results = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const price = await fetchPrice({ symbol, preferredSource });
        return { symbol, price, success: true };
      } catch (error) {
        return {
          symbol,
          price: null,
          success: false,
          error: error.message,
          code: error.code || 'MARKET_DATA_PRICE_NOT_FOUND',
        };
      }
    }),
  );

  return results;
}

async function fetchLatest({ symbol }) {
  const normalized = await cryptoSymbol.normalizeSymbol(symbol);
  const record = await priceFeedRepository.findLatest(normalized.canonicalSymbol);
  if (!record) {
    throw new PriceNotFoundError('No persisted price was found', {
      canonicalSymbol: normalized.canonicalSymbol,
    });
  }
  const ageSeconds =
    (Date.now() - new Date(record.fetched_at).getTime()) / 1000;
  if (ageSeconds > MARKET_DATA_MAX_STALE_SECONDS) {
    throw new PriceStaleError('Persisted price exceeds the staleness threshold', {
      canonicalSymbol: normalized.canonicalSymbol,
      ageSeconds,
    });
  }
  return {
    canonicalSymbol: record.canonical_symbol,
    price: Number(record.price),
    source: record.source,
    sourceSymbol: record.source_symbol,
    fetchedAt: record.fetched_at,
    ageSeconds: Math.round(ageSeconds),
    status: PRICE_FEED_STATUSES.FRESH,
  };
}

async function fetchHistorical({ symbol, from, to, page, pageSize }) {
  const normalized = await cryptoSymbol.normalizeSymbol(symbol);
  return priceFeedRepository.listSnapshots({
    canonicalSymbol: normalized.canonicalSymbol,
    from,
    to,
    page,
    pageSize,
  });
}

async function getVolatility({ symbol, from, to }) {
  const normalized = await cryptoSymbol.normalizeSymbol(symbol);
  const stats = await priceFeedRepository.aggregateVolatility({
    canonicalSymbol: normalized.canonicalSymbol,
    from,
    to,
  });
  return {
    canonicalSymbol: normalized.canonicalSymbol,
    minPrice: Number(stats.min_price) || 0,
    maxPrice: Number(stats.max_price) || 0,
    avgPrice: Number(stats.avg_price) || 0,
    stddevPrice: Number(stats.stddev_price) || 0,
    samples: Number(stats.samples) || 0,
  };
}

function clearCache(symbol) {
  if (symbol) {
    marketDataCache.invalidate(CACHE_NAMESPACE, symbol);
    return;
  }
  marketDataCache.invalidate(CACHE_NAMESPACE);
}

function listAvailableSources() {
  return Object.keys(SOURCE_FETCHERS);
}

async function isSourceAvailable(source) {
  const fetcher = SOURCE_FETCHERS[source];
  if (!fetcher) {
    throw new SourceUnavailableError(`Source ${source} is not supported`);
  }
  try {
    await fetcher('BTC/USDT');
    return true;
  } catch (_error) {
    return false;
  }
}

module.exports = {
  generateSnapshotId,
  normalizePrice,
  computeMedian,
  computeDeviationPercent,
  selectSources,
  fetchFromSources,
  fetchPrice,
  fetchPriceBatch,
  fetchLatest,
  fetchHistorical,
  getVolatility,
  clearCache,
  listAvailableSources,
  isSourceAvailable,
  CACHE_NAMESPACE,
};