'use strict';

const tokenMetadataRepository = require('./token-metadata.repository');
const marketDataCache = require('./market-data-cache.service');

const {
  MARKET_DATA_DEFAULTS,
  TOKEN_TAGS,
} = require('./market-data.constants');

const {
  InvalidRequestError,
  TokenNotFoundError,
} = require('./market-data.errors');

/**
 * SignalForge - Token Metadata Service
 *
 * Provides normalized SPL token metadata across gateways. Prefers
 * cached metadata and falls back to gateway-specific resolution.
 */

const CACHE_NAMESPACE = 'crypto-token-metadata';

function inferTags({ symbol, name } = {}) {
  const tags = [];
  const upper = (symbol || '').toUpperCase();
  const label = (name || '').toLowerCase();

  if (['USDT', 'USDC', 'DAI', 'USDE', 'FDUSD', 'TUSD', 'PYUSD'].includes(upper)) {
    tags.push(TOKEN_TAGS.STABLE);
  }
  if (['BTC', 'ETH', 'SOL', 'WBTC', 'WETH', 'WSOL'].includes(upper)) {
    tags.push(TOKEN_TAGS.MAJOR);
  }
  if (['BONK', 'WIF', 'MEME', 'PEPE', 'SHIB'].includes(upper)) {
    tags.push(TOKEN_TAGS.MEME);
  }
  if (['MSOL', 'BSOL', 'JITOSOL', 'STSOL'].includes(upper)) {
    tags.push(TOKEN_TAGS.LST);
  }
  if (['RAY', 'ORCA', 'JUP', 'JTO'].includes(upper)) {
    tags.push(TOKEN_TAGS.GOVERNANCE);
  }
  if (label.includes('wrapped')) {
    tags.push(TOKEN_TAGS.WRAPPED);
  }

  if (tags.length === 0) {
    tags.push(TOKEN_TAGS.UNKNOWN);
  }

  return tags;
}

function normalizeMetadataRecord(record) {
  if (!record) {
    return null;
  }
  return {
    mint: record.mint,
    symbol: record.symbol,
    name: record.name,
    decimals: record.decimals,
    logoUri: record.logo_uri,
    tags: Array.isArray(record.tags)
      ? record.tags
      : record.tags
      ? JSON.parse(record.tags)
      : [],
    isVerified: record.is_verified === true,
    source: record.source,
    updatedAt: record.updated_at,
  };
}

async function fetchFromGateways(mint) {
  const gateways = [
    { key: 'jupiter', loader: () => require('../../execution/gateways/jupiter') },
    { key: 'raydium', loader: () => require('../../execution/gateways/raydium') },
    { key: 'orca', loader: () => require('../../execution/gateways/orca') },
  ];

  for (const gateway of gateways) {
    try {
      const mod = gateway.loader();
      const metadata = await mod.token.resolveTokenMetadata(mint);
      if (metadata) {
        return {
          ...metadata,
          source: gateway.key,
        };
      }
    } catch (_error) {
      // Continue with next gateway.
    }
  }

  return null;
}

async function fetchMetadata({ mint, persist = true } = {}) {
  if (!mint) {
    throw new InvalidRequestError('mint is required');
  }

  const cacheKey = mint;

  return marketDataCache.getOrSet(
    CACHE_NAMESPACE,
    cacheKey,
    async () => {
      const persisted = await tokenMetadataRepository.findByMint(mint);
      if (persisted) {
        return normalizeMetadataRecord(persisted);
      }

      const fromGateway = await fetchFromGateways(mint);
      if (!fromGateway) {
        throw new TokenNotFoundError(`Token metadata was not found for ${mint}`, { mint });
      }

      const tags = inferTags({
        symbol: fromGateway.symbol,
        name: fromGateway.name,
      });

      if (persist) {
        try {
          const record = await tokenMetadataRepository.upsertMetadata(null, {
            mint,
            symbol: fromGateway.symbol,
            name: fromGateway.name,
            decimals: fromGateway.decimals,
            logoUri: fromGateway.logoURI || fromGateway.logoUri,
            tags,
            isVerified: true,
            source: fromGateway.source,
            metadata: { raw: fromGateway },
          });
          return normalizeMetadataRecord(record);
        } catch (_error) {
          // Persistence failures do not affect the result.
        }
      }

      return {
        mint,
        symbol: fromGateway.symbol,
        name: fromGateway.name,
        decimals: fromGateway.decimals,
        logoUri: fromGateway.logoURI || fromGateway.logoUri,
        tags,
        isVerified: true,
        source: fromGateway.source,
      };
    },
    { ttlSeconds: MARKET_DATA_DEFAULTS.TOKEN_TTL_SECONDS },
  );
}

async function resolveBySymbol(symbol) {
  if (!symbol) {
    throw new InvalidRequestError('symbol is required');
  }
  const record = await tokenMetadataRepository.findBySymbol(symbol.toUpperCase());
  if (record) {
    return normalizeMetadataRecord(record);
  }

  const cryptoSymbol = require('../../signals/crypto/crypto-symbol.service');
  const mint = await cryptoSymbol.normalizeSymbol(symbol).then((mapped) => {
    return mapped;
  });
  void mint;
  throw new TokenNotFoundError(`Token metadata was not found for symbol ${symbol}`, { symbol });
}

async function listTokens(filters = {}) {
  return tokenMetadataRepository.list(filters);
}

async function listByTag(tag, pagination) {
  return tokenMetadataRepository.listByTag({ tag, ...(pagination || {}) });
}

async function countsBySource() {
  return tokenMetadataRepository.countBySource();
}

async function registerMetadata({
  mint,
  symbol,
  name,
  decimals,
  logoUri,
  tags,
  isVerified,
  source,
  sourceReference,
  metadata,
} = {}) {
  if (!mint) {
    throw new InvalidRequestError('mint is required');
  }
  return tokenMetadataRepository.upsertMetadata(null, {
    mint,
    symbol,
    name,
    decimals,
    logoUri,
    tags,
    isVerified,
    source,
    sourceReference,
    metadata,
  });
}

function clearCache(mint) {
  if (mint) {
    marketDataCache.invalidate(CACHE_NAMESPACE, mint);
    return;
  }
  marketDataCache.invalidate(CACHE_NAMESPACE);
}

module.exports = {
  inferTags,
  normalizeMetadataRecord,
  fetchFromGateways,
  fetchMetadata,
  resolveBySymbol,
  listTokens,
  listByTag,
  countsBySource,
  registerMetadata,
  clearCache,
  CACHE_NAMESPACE,
  TOKEN_TAGS,
};