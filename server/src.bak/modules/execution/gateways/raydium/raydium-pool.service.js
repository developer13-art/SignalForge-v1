'use strict';

const raydiumClient = require('./raydium-client.service');
const raydiumRepository = require('./raydium.repository');

const {
  RAYDIUM_POOL_TYPES,
} = require('./raydium.constants');

const {
  PoolNotFoundError,
  InvalidRequestError,
} = require('./raydium.errors');

/**
 * SignalForge - Raydium Pool Service
 *
 * Manages the pool registry used by the Raydium gateway. Pools are
 * cached locally so quotes do not require an RPC call on every request.
 */

let cachedPools = null;
let cachedPoolsAt = 0;

const POOLS_TTL_MS = 10 * 60 * 1000;

function normalizePool(raw) {
  if (!raw) {
    return null;
  }

  return {
    id: raw.id || raw.ammId || raw.poolId,
    poolType: raw.type || RAYDIUM_POOL_TYPES.AMM_V4,
    baseMint: raw.mintA?.address || raw.baseMint || raw.mintA,
    quoteMint: raw.mintB?.address || raw.quoteMint || raw.mintB,
    baseSymbol: raw.mintA?.symbol || raw.baseSymbol || null,
    quoteSymbol: raw.mintB?.symbol || raw.quoteSymbol || null,
    ammId: raw.id || raw.ammId || null,
    lpMint: raw.lpMint || null,
    price: raw.price || null,
    liquidityUsd: raw.tvl || raw.liquidity || null,
    volume24hUsd: raw.day?.volume || null,
    feeRate: raw.feeRate || null,
    isActive: raw.isActive !== false,
  };
}

async function loadPools({ poolType, page = 1, pageSize = 1000 } = {}) {
  const now = Date.now();
  if (!poolType && cachedPools && now - cachedPoolsAt < POOLS_TTL_MS) {
    return cachedPools;
  }

  const response = await raydiumClient.fetchPools({ poolType, page, pageSize });
  const raw = Array.isArray(response.data) ? response.data : [];
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

  const persisted = await raydiumRepository.findPoolsByMints({
    baseMint,
    quoteMint,
    poolType,
  });

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
  return raydiumRepository.listActivePools(filters);
}

async function fetchPoolInfo({ ids } = {}) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new InvalidRequestError('ids must be a non-empty array');
  }
  const response = await raydiumClient.fetchPoolInfo({ ids });
  return response.data || [];
}

async function fetchPoolKeys({ ids } = {}) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new InvalidRequestError('ids must be a non-empty array');
  }
  const response = await raydiumClient.fetchPoolKeys({ ids });
  return response.data || [];
}

async function syncPoolsToDatabase({ poolType } = {}) {
  const pools = await loadPools({ poolType });
  const persisted = [];

  for (const pool of pools) {
    try {
      const record = await raydiumRepository.upsertPool(null, {
        id: pool.id,
        poolType: pool.poolType,
        baseMint: pool.baseMint,
        quoteMint: pool.quoteMint,
        baseSymbol: pool.baseSymbol,
        quoteSymbol: pool.quoteSymbol,
        ammId: pool.ammId,
        lpMint: pool.lpMint,
        price: pool.price,
        liquidityUsd: pool.liquidityUsd,
        volume24hUsd: pool.volume24hUsd,
        feeRate: pool.feeRate,
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
  const pool = await raydiumRepository.findPoolById(id);
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
  fetchPoolKeys,
  syncPoolsToDatabase,
  findPoolById,
  describePool,
  clearCache,
};