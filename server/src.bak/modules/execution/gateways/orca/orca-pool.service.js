'use strict';

const orcaClient = require('./orca-client.service');
const orcaRepository = require('./orca.repository');

const {
  ORCA_POOL_TYPES,
} = require('./orca.constants');

const {
  PoolNotFoundError,
  InvalidRequestError,
} = require('./orca.errors');

/**
 * SignalForge - Orca Pool Service
 *
 * Manages the Orca pool registry used by the Orca gateway. Whirlpools
 * are concentrated liquidity pools; the service normalizes them into
 * a common pool record.
 */

let cachedPools = null;
let cachedPoolsAt = 0;

const POOLS_TTL_MS = 10 * 60 * 1000;

function normalizePool(raw) {
  if (!raw) {
    return null;
  }

  return {
    id: raw.id || raw.address || raw.whirlpoolAddress,
    poolType: raw.type || ORCA_POOL_TYPES.WHIRLPOOL,
    baseMint: raw.tokenA?.mint || raw.tokenMintA || raw.mintA,
    quoteMint: raw.tokenB?.mint || raw.tokenMintB || raw.mintB,
    baseSymbol: raw.tokenA?.symbol || raw.symbolA || null,
    quoteSymbol: raw.tokenB?.symbol || raw.symbolB || null,
    whirlpoolAddress: raw.address || raw.whirlpoolAddress || null,
    tickSpacing: raw.tickSpacing || null,
    feeRate: raw.feeRate || null,
    price: raw.price || null,
    liquidityUsd: raw.tvlUsd || raw.liquidityUsd || raw.liquidity || null,
    volume24hUsd: raw.volume24hUsd || raw.volume24h || null,
    isActive: raw.isActive !== false,
  };
}

async function loadPools({ poolType, page = 1, pageSize = 1000 } = {}) {
  const now = Date.now();
  if (!poolType && cachedPools && now - cachedPoolsAt < POOLS_TTL_MS) {
    return cachedPools;
  }

  const response = await orcaClient.fetchPools({ poolType, page, pageSize });
  const raw = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];
  const pools = raw.map(normalizePool).filter(Boolean);

  if (!poolType) {
    cachedPools = pools;
    cachedPoolsAt = now;
  }

  return pools;
}

async function findPoolByMints({ baseMint, quoteMint, poolType } = {}) {
  if (!baseMint || !quoteMint) {
    throw new InvalidRequestError('baseMint and quoteMint are required');
  }

  const persisted = await orcaRepository.findPoolsByMints({ baseMint, quoteMint, poolType });

  if (persisted.length > 0) {
    return persisted[0];
  }

  const pools = await loadPools({ poolType });
  const match = pools.find(
    (pool) =>
      (pool.baseMint === baseMint && pool.quoteMint === quoteMint) ||
      (pool.baseMint === quoteMint && pool.quoteMint === baseMint),
  );

  return match || null;
}

async function listActivePools(filters) {
  return orcaRepository.listActivePools(filters);
}

async function fetchPoolInfo(id) {
  if (!id) {
    throw new InvalidRequestError('Pool id is required');
  }
  return orcaClient.fetchPoolInfo({ id });
}

async function fetchWhirlpools() {
  return orcaClient.fetchWhirlpools();
}

async function syncPoolsToDatabase({ poolType } = {}) {
  const pools = await loadPools({ poolType });
  const persisted = [];

  for (const pool of pools) {
    try {
      const record = await orcaRepository.upsertPool(null, {
        id: pool.id,
        poolType: pool.poolType,
        baseMint: pool.baseMint,
        quoteMint: pool.quoteMint,
        baseSymbol: pool.baseSymbol,
        quoteSymbol: pool.quoteSymbol,
        whirlpoolAddress: pool.whirlpoolAddress,
        tickSpacing: pool.tickSpacing,
        feeRate: pool.feeRate,
        price: pool.price,
        liquidityUsd: pool.liquidityUsd,
        volume24hUsd: pool.volume24hUsd,
        isActive: pool.isActive,
        metadata: { raw: pool },
      });
      persisted.push(record);
    } catch (_error) {
      // Continue on individual failure.
    }
  }

  return persisted;
}

async function findPoolById(id) {
  const pool = await orcaRepository.findPoolById(id);
  if (!pool) {
    throw new PoolNotFoundError(`Pool ${id} was not found`, { id });
  }
  return pool;
}

async function describePool(id) {
  const pool = await findPoolById(id);
  return {
    id: pool.id,
    poolType: pool.pool_type,
    baseMint: pool.base_mint,
    quoteMint: pool.quote_mint,
    baseSymbol: pool.base_symbol,
    quoteSymbol: pool.quote_symbol,
    liquidityUsd: pool.liquidity_usd,
    volume24hUsd: pool.volume_24h_usd,
    isActive: pool.is_active,
  };
}

function clearCache() {
  cachedPools = null;
  cachedPoolsAt = 0;
}

module.exports = {
  normalizePool,
  loadPools,
  findPoolByMints,
  listActivePools,
  fetchPoolInfo,
  fetchWhirlpools,
  syncPoolsToDatabase,
  findPoolById,
  describePool,
  clearCache,
};