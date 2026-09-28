'use strict';

const crypto = require('crypto');

const poolRegistryRepository = require('./pool-registry.repository');
const marketDataCache = require('./market-data-cache.service');

const {
  MARKET_DATA_SOURCES,
  POOL_TYPES,
  MARKET_DATA_DEFAULTS,
} = require('./market-data.constants');

const {
  InvalidRequestError,
  PoolNotFoundError,
} = require('./market-data.errors');

/**
 * SignalForge - Pool Registry Service
 *
 * The pool registry is the canonical pool index across every DEX
 * gateway. It receives discovered pools from gateway sync jobs and
 * exposes normalized pool lookups to the rest of the platform.
 */

const CACHE_NAMESPACE = 'crypto-pools';

function generatePoolId() {
  return `pool_${crypto.randomBytes(10).toString('hex')}`;
}

async function registerPool({
  source,
  address,
  poolType,
  baseMint,
  quoteMint,
  baseSymbol,
  quoteSymbol,
  tickSpacing,
  feeRate,
  lpMint,
  metadata,
} = {}) {
  if (!source) {
    throw new InvalidRequestError('source is required');
  }
  if (!address) {
    throw new InvalidRequestError('address is required');
  }
  if (!baseMint || !quoteMint) {
    throw new InvalidRequestError('baseMint and quoteMint are required');
  }

  const record = await poolRegistryRepository.upsertPool(null, {
    id: generatePoolId(),
    source,
    poolType: poolType || POOL_TYPES.AMM,
    address,
    baseMint,
    quoteMint,
    baseSymbol,
    quoteSymbol,
    tickSpacing,
    feeRate,
    lpMint,
    metadata: metadata || {},
  });

  marketDataCache.invalidate(CACHE_NAMESPACE);

  return record;
}

async function registerPools(pools) {
  if (!Array.isArray(pools) || pools.length === 0) {
    return [];
  }
  const results = [];
  for (const pool of pools) {
    try {
      const record = await registerPool(pool);
      results.push({ success: true, record, input: pool });
    } catch (error) {
      results.push({
        success: false,
        error: error.message,
        code: error.code || 'MARKET_DATA_INVALID_REQUEST',
        input: pool,
      });
    }
  }
  return results;
}

async function findPool({ source, address } = {}) {
  if (!source || !address) {
    throw new InvalidRequestError('source and address are required');
  }
  const record = await poolRegistryRepository.findPoolByAddress({ source, address });
  if (!record) {
    throw new PoolNotFoundError('Pool was not found in the registry', {
      source,
      address,
    });
  }
  return record;
}

async function findPoolsByMints({ baseMint, quoteMint, source } = {}) {
  if (!baseMint || !quoteMint) {
    throw new InvalidRequestError('baseMint and quoteMint are required');
  }
  return poolRegistryRepository.findPoolsByMints({ baseMint, quoteMint, source });
}

async function listPools({ source, poolType, page, pageSize } = {}) {
  return poolRegistryRepository.listActive({ source, poolType, page, pageSize });
}

async function countsBySource() {
  return poolRegistryRepository.countBySource();
}

async function markPoolInactive({ source, address } = {}) {
  if (!source || !address) {
    throw new InvalidRequestError('source and address are required');
  }
  const result = await poolRegistryRepository.markInactive({ source, address });
  marketDataCache.invalidate(CACHE_NAMESPACE);
  return result;
}

async function syncFromGateway({ gateway } = {}) {
  if (!gateway) {
    throw new InvalidRequestError('gateway is required');
  }

  let pools = [];

  if (gateway === MARKET_DATA_SOURCES.RAYDIUM) {
    const raydium = require('../../execution/gateways/raydium');
    const response = await raydium.pool.loadPools({ page: 1, pageSize: 1000 });
    pools = (response || []).map((pool) => ({
      source: 'raydium',
      address: pool.id || pool.ammId,
      poolType: POOL_TYPES.AMM,
      baseMint: pool.baseMint,
      quoteMint: pool.quoteMint,
      baseSymbol: pool.baseSymbol,
      quoteSymbol: pool.quoteSymbol,
      feeRate: pool.feeRate,
      lpMint: pool.lpMint,
      metadata: { raw: pool },
    }));
  } else if (gateway === MARKET_DATA_SOURCES.ORCA) {
    const orca = require('../../execution/gateways/orca');
    const response = await orca.pool.loadPools({ page: 1, pageSize: 1000 });
    pools = (response || []).map((pool) => ({
      source: 'orca',
      address: pool.whirlpoolAddress || pool.id,
      poolType: POOL_TYPES.CLMM,
      baseMint: pool.baseMint,
      quoteMint: pool.quoteMint,
      baseSymbol: pool.baseSymbol,
      quoteSymbol: pool.quoteSymbol,
      tickSpacing: pool.tickSpacing,
      feeRate: pool.feeRate,
      metadata: { raw: pool },
    }));
  } else {
    throw new InvalidRequestError(`Gateway ${gateway} is not supported for pool sync`);
  }

  return registerPools(pools);
}

async function describePool({ source, address } = {}) {
  const pool = await findPool({ source, address });
  return {
    id: pool.id,
    source: pool.source,
    address: pool.address,
    poolType: pool.pool_type,
    baseMint: pool.base_mint,
    quoteMint: pool.quote_mint,
    baseSymbol: pool.base_symbol,
    quoteSymbol: pool.quote_symbol,
    tickSpacing: pool.tick_spacing,
    feeRate: pool.fee_rate,
    isActive: pool.is_active,
  };
}

function clearCache() {
  marketDataCache.invalidate(CACHE_NAMESPACE);
}

module.exports = {
  generatePoolId,
  registerPool,
  registerPools,
  findPool,
  findPoolsByMints,
  listPools,
  countsBySource,
  markPoolInactive,
  syncFromGateway,
  describePool,
  clearCache,
  CACHE_NAMESPACE,
};