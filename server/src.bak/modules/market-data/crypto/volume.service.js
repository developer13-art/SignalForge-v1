'use strict';

const volumeRepository = require('./volume.repository');
const marketDataCache = require('./market-data-cache.service');
const cryptoSymbol = require('../../signals/crypto/crypto-symbol.service');

const {
  VOLUME_WINDOWS,
  VOLUME_WINDOW_SECONDS,
  MARKET_DATA_DEFAULTS,
} = require('./market-data.constants');

const {
  InvalidRequestError,
  VolumeNotFoundError,
} = require('./market-data.errors');

/**
 * SignalForge - Volume Service
 *
 * Provides rolling volume per symbol and window. Volume is sourced
 * from the same DEX gateways that provide prices; the service
 * aggregates rollups and persists them for analytics.
 */

const CACHE_NAMESPACE = 'crypto-volume';

function resolveWindowSeconds(window) {
  if (!window) {
    return VOLUME_WINDOW_SECONDS[VOLUME_WINDOWS.H24];
  }
  return VOLUME_WINDOW_SECONDS[window] || VOLUME_WINDOW_SECONDS[VOLUME_WINDOWS.H24];
}

function normalizeVolume(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return 0;
  }
  return numeric;
}

async function fetchVolumeFromJupiter(canonicalSymbol) {
  try {
    const jupiter = require('../../execution/gateways/jupiter');
    const [base, rest] = canonicalSymbol.split('/');
    const [quote] = (rest || '').split('-');
    const baseMint = await jupiter.gateway.resolveToken(base);
    const quoteMint = await jupiter.gateway.resolveToken(quote);
    void baseMint;
    void quoteMint;
    return null;
  } catch (_error) {
    return null;
  }
}

async function fetchVolumeFromRaydium(canonicalSymbol) {
  try {
    const raydium = require('../../execution/gateways/raydium');
    const [base, rest] = canonicalSymbol.split('/');
    const [quote] = (rest || '').split('-');
    const baseMint = await raydium.gateway.resolveToken(base);
    const quoteMint = await raydium.gateway.resolveToken(quote);
    const pools = await raydium.pool.findPoolByMints({ baseMint, quoteMint });
    if (!pools) {
      return null;
    }
    return {
      source: 'raydium',
      volumeQuote: normalizeVolume(pools.volume_24h_usd),
    };
  } catch (_error) {
    return null;
  }
}

async function fetchVolumeFromOrca(canonicalSymbol) {
  try {
    const orca = require('../../execution/gateways/orca');
    const [base, rest] = canonicalSymbol.split('/');
    const [quote] = (rest || '').split('-');
    const baseMint = await orca.gateway.resolveToken(base);
    const quoteMint = await orca.gateway.resolveToken(quote);
    const pools = await orca.pool.findPoolByMints({ baseMint, quoteMint });
    if (!pools) {
      return null;
    }
    return {
      source: 'orca',
      volumeQuote: normalizeVolume(pools.volume_24h_usd),
    };
  } catch (_error) {
    return null;
  }
}

const SOURCE_FETCHERS = Object.freeze({
  raydium: fetchVolumeFromRaydium,
  orca: fetchVolumeFromOrca,
  jupiter: fetchVolumeFromJupiter,
});

async function fetchFromSources(canonicalSymbol) {
  const sources = Object.keys(SOURCE_FETCHERS);
  const results = await Promise.all(
    sources.map(async (source) => {
      const fetcher = SOURCE_FETCHERS[source];
      try {
        const result = await fetcher(canonicalSymbol);
        return result;
      } catch (_error) {
        return null;
      }
    }),
  );
  return results.filter(Boolean);
}

function selectBestVolume(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return null;
  }
  return entries.reduce((best, current) =>
    normalizeVolume(current.volumeQuote) > normalizeVolume(best.volumeQuote) ? current : best,
  );
}

async function fetchVolume({ symbol, window = VOLUME_WINDOWS.H24, persist = true } = {}) {
  if (!symbol) {
    throw new InvalidRequestError('symbol is required');
  }

  const normalized = await cryptoSymbol.normalizeSymbol(symbol);
  const canonicalSymbol = normalized.canonicalSymbol;
  const cacheKey = `${canonicalSymbol}:${window}`;

  return marketDataCache.getOrSet(
    CACHE_NAMESPACE,
    cacheKey,
    async () => {
      const entries = await fetchFromSources(canonicalSymbol);
      const best = selectBestVolume(entries);

      if (!best) {
        const persisted = await volumeRepository.findRollup({ canonicalSymbol, window });
        if (!persisted) {
          throw new VolumeNotFoundError(`No volume available for ${canonicalSymbol}`, {
            canonicalSymbol,
            window,
          });
        }
        return {
          canonicalSymbol,
          window,
          volumeQuote: Number(persisted.volume_quote),
          volumeBase: persisted.volume_base ? Number(persisted.volume_base) : null,
          tradesCount: persisted.trades_count,
          source: 'persisted',
          windowStart: persisted.window_start,
          windowEnd: persisted.window_end,
          fetchedAt: persisted.fetched_at,
          stale: true,
        };
      }

      const windowSeconds = resolveWindowSeconds(window);
      const windowEnd = new Date().toISOString();
      const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();

      const result = {
        canonicalSymbol,
        window,
        volumeQuote: normalizeVolume(best.volumeQuote),
        volumeBase: null,
        tradesCount: 0,
        source: best.source,
        windowStart,
        windowEnd,
        fetchedAt: new Date().toISOString(),
        stale: false,
      };

      if (persist) {
        try {
          await volumeRepository.upsertRollup(null, {
            canonicalSymbol,
            window,
            volumeQuote: result.volumeQuote,
            volumeBase: result.volumeBase,
            tradesCount: result.tradesCount,
            windowStart: result.windowStart,
            windowEnd: result.windowEnd,
            metadata: { source: result.source },
          });
        } catch (_error) {
          // Persistence failures do not affect the result.
        }
      }

      return result;
    },
    { ttlSeconds: MARKET_DATA_DEFAULTS.VOLUME_TTL_SECONDS },
  );
}

async function listRollups({ symbol } = {}) {
  if (!symbol) {
    throw new InvalidRequestError('symbol is required');
  }
  const normalized = await cryptoSymbol.normalizeSymbol(symbol);
  const rows = await volumeRepository.listRollups(normalized.canonicalSymbol);
  return rows.map((row) => ({
    canonicalSymbol: row.canonical_symbol,
    window: row.window,
    volumeQuote: Number(row.volume_quote),
    volumeBase: row.volume_base ? Number(row.volume_base) : null,
    tradesCount: row.trades_count,
    fetchedAt: row.fetched_at,
  }));
}

async function listTopByVolume({ window = VOLUME_WINDOWS.H24, limit = 20 } = {}) {
  const rows = await volumeRepository.listTopByVolume({ window, limit });
  return rows.map((row) => ({
    canonicalSymbol: row.canonical_symbol,
    volumeQuote: Number(row.volume_quote),
    window: row.window,
    fetchedAt: row.fetched_at,
  }));
}

async function getVolumeSummary({ symbol } = {}) {
  if (!symbol) {
    throw new InvalidRequestError('symbol is required');
  }
  const normalized = await cryptoSymbol.normalizeSymbol(symbol);
  const rollups = await volumeRepository.listRollups(normalized.canonicalSymbol);
  const summary = {};
  for (const row of rollups) {
    summary[row.window] = {
      volumeQuote: Number(row.volume_quote),
      tradesCount: row.trades_count,
    };
  }
  return {
    canonicalSymbol: normalized.canonicalSymbol,
    windows: summary,
  };
}

function clearCache(symbol) {
  if (symbol) {
    for (const window of Object.values(VOLUME_WINDOWS)) {
      marketDataCache.invalidate(CACHE_NAMESPACE, `${symbol}:${window}`);
    }
    return;
  }
  marketDataCache.invalidate(CACHE_NAMESPACE);
}

module.exports = {
  resolveWindowSeconds,
  normalizeVolume,
  selectBestVolume,
  fetchFromSources,
  fetchVolume,
  listRollups,
  listTopByVolume,
  getVolumeSummary,
  clearCache,
  CACHE_NAMESPACE,
  VOLUME_WINDOWS,
};