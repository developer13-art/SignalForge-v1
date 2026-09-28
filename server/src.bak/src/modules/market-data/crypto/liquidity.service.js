'use strict';

const crypto = require('crypto');

const liquidityRepository = require('./liquidity.repository');
const marketDataCache = require('./market-data-cache.service');
const cryptoSymbol = require('../../signals/crypto/crypto-symbol.service');

const {
  LIQUIDITY_TIERS,
  LIQUIDITY_THRESHOLDS_USD,
  MARKET_DATA_DEFAULTS,
  MARKET_DATA_METRICS,
} = require('./market-data.constants');

const {
  InvalidRequestError,
  LiquidityNotFoundError,
} = require('./market-data.errors');

/**
 * SignalForge - Liquidity Service
 *
 * Fetches and classifies pool liquidity. The service aggregates
 * liquidity across pools for a given symbol and returns a tiered
 * assessment that the risk engine uses for position sizing.
 */

const CACHE_NAMESPACE = 'crypto-liquidity';

function generateSnapshotId() {
  return `clq_${crypto.randomBytes(10).toString('hex')}`;
}

function classifyLiquidity(liquidityUsd) {
  const value = Number(liquidityUsd) || 0;
  if (value >= LIQUIDITY_THRESHOLDS_USD.deep) {
    return LIQUIDITY_TIERS.DEEP;
  }
  if (value >= LIQUIDITY_THRESHOLDS_USD.healthy) {
    return LIQUIDITY_TIERS.HEALTHY;
  }
  if (value >= LIQUIDITY_THRESHOLDS_USD.moderate) {
    return LIQUIDITY_TIERS.MODERATE;
  }
  if (value >= LIQUIDITY_THRESHOLDS_USD.thin) {
    return LIQUIDITY_TIERS.THIN;
  }
  return LIQUIDITY_TIERS.ILLIQUID;
}

async function fetchLiquidityFromJupiter(canonicalSymbol) {
  try {
    const jupiter = require('../../execution/gateways/jupiter');
    const [base, rest] = canonicalSymbol.split('/');
    const [quote] = (rest || '').split('-');
    const baseMint = await jupiter.gateway.resolveToken(base);
    const quoteMint = await jupiter.gateway.resolveToken(quote);
    const pool = await jupiter.token.resolveTokenMetadata(baseMint);
    void quoteMint;
    if (!pool) {
      return null;
    }
    return null;
  } catch (_error) {
    return null;
  }
}

async function fetchLiquidityFromRaydium(canonicalSymbol) {
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
      poolId: pools.id || pools.amm_id,
      source: 'raydium',
      baseMint,
      quoteMint,
      liquidityUsd: Number(pools.liquidity_usd || 0),
      feeRate: pools.fee_rate || null,
    };
  } catch (_error) {
    return null;
  }
}

async function fetchLiquidityFromOrca(canonicalSymbol) {
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
      poolId: pools.id || pools.whirlpool_address,
      source: 'orca',
      baseMint,
      quoteMint,
      liquidityUsd: Number(pools.liquidity_usd || 0),
      feeRate: pools.fee_rate || null,
    };
  } catch (_error) {
    return null;
  }
}

const SOURCE_FETCHERS = Object.freeze({
  jupiter: fetchLiquidityFromJupiter,
  raydium: fetchLiquidityFromRaydium,
  orca: fetchLiquidityFromOrca,
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
        if (global.__signalforgeMetrics) {
          global.__signalforgeMetrics.increment(MARKET_DATA_METRICS.SOURCE_FAILURES, { source });
        }
        return null;
      }
    }),
  );
  return results.filter(Boolean);
}

async function fetchLiquidity({ symbol, persist = true } = {}) {
  if (!symbol) {
    throw new InvalidRequestError('symbol is required');
  }

  const normalized = await cryptoSymbol.normalizeSymbol(symbol);
  const canonicalSymbol = normalized.canonicalSymbol;
  const cacheKey = canonicalSymbol;

  return marketDataCache.getOrSet(
    CACHE_NAMESPACE,
    cacheKey,
    async () => {
      const pools = await fetchFromSources(canonicalSymbol);

      if (pools.length === 0) {
        const persisted = await liquidityRepository.listLatestBySymbol(canonicalSymbol);
        if (persisted.length === 0) {
          throw new LiquidityNotFoundError(`No liquidity available for ${canonicalSymbol}`, {
            canonicalSymbol,
          });
        }
        const totalLiquidity = persisted.reduce(
          (sum, entry) => sum + Number(entry.liquidity_usd || 0),
          0,
        );
        return {
          canonicalSymbol,
          totalLiquidityUsd: totalLiquidity,
          tier: classifyLiquidity(totalLiquidity),
          pools: persisted.map(describePool),
          stale: true,
          fetchedAt: persisted[0].fetched_at,
        };
      }

      const totalLiquidity = pools.reduce(
        (sum, entry) => sum + Number(entry.liquidityUsd || 0),
        0,
      );

      const result = {
        canonicalSymbol,
        totalLiquidityUsd: totalLiquidity,
        tier: classifyLiquidity(totalLiquidity),
        pools: pools.map(describePool),
        stale: false,
        fetchedAt: new Date().toISOString(),
      };

      if (persist) {
        for (const pool of pools) {
          try {
            await liquidityRepository.insertSnapshot(null, {
              id: generateSnapshotId(),
              poolId: pool.poolId,
              source: pool.source,
              baseMint: pool.baseMint,
              quoteMint: pool.quoteMint,
              canonicalSymbol,
              liquidityUsd: pool.liquidityUsd,
              feeRate: pool.feeRate,
              tier: classifyLiquidity(pool.liquidityUsd),
              metadata: {},
            });
            await liquidityRepository.upsertLatest(null, {
              poolId: pool.poolId,
              source: pool.source,
              baseMint: pool.baseMint,
              quoteMint: pool.quoteMint,
              canonicalSymbol,
              liquidityUsd: pool.liquidityUsd,
              feeRate: pool.feeRate,
              tier: classifyLiquidity(pool.liquidityUsd),
              metadata: {},
            });
          } catch (_error) {
            // Persistence failures do not affect the result.
          }
        }
      }

      return result;
    },
    { ttlSeconds: MARKET_DATA_DEFAULTS.LIQUIDITY_TTL_SECONDS },
  );
}

function describePool(pool) {
  return {
    poolId: pool.pool_id || pool.poolId,
    source: pool.source,
    baseMint: pool.base_mint || pool.baseMint,
    quoteMint: pool.quote_mint || pool.quoteMint,
    liquidityUsd: Number(pool.liquidity_usd || pool.liquidityUsd || 0),
    feeRate: pool.fee_rate || pool.feeRate || null,
    tier: pool.tier || classifyLiquidity(pool.liquidity_usd || pool.liquidityUsd),
  };
}

async function fetchPoolLiquidity({ poolId } = {}) {
  if (!poolId) {
    throw new InvalidRequestError('poolId is required');
  }
  const record = await liquidityRepository.findLatestByPool(poolId);
  if (!record) {
    throw new LiquidityNotFoundError('Pool liquidity was not found', { poolId });
  }
  return describePool(record);
}

async function fetchHistorical({ poolId, from, to, page, pageSize } = {}) {
  if (!poolId) {
    throw new InvalidRequestError('poolId is required');
  }
  return liquidityRepository.listSnapshots({ poolId, from, to, page, pageSize });
}

async function aggregateByTier() {
  return liquidityRepository.aggregateLiquidityByTier();
}

function clearCache(symbol) {
  if (symbol) {
    marketDataCache.invalidate(CACHE_NAMESPACE, symbol);
    return;
  }
  marketDataCache.invalidate(CACHE_NAMESPACE);
}

module.exports = {
  generateSnapshotId,
  classifyLiquidity,
  fetchFromSources,
  fetchLiquidity,
  fetchPoolLiquidity,
  fetchHistorical,
  aggregateByTier,
  clearCache,
  describePool,
  CACHE_NAMESPACE,
  LIQUIDITY_TIERS,
};