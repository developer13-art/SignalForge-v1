'use strict';

const hyperliquidClient = require('./hyperliquid-client.service');
const hyperliquidRepository = require('./hyperliquid.repository');

const {
  HYPERLIQUID_MAX_LEVERAGE,
} = require('./hyperliquid.constants');

const {
  MarketNotFoundError,
  InvalidRequestError,
} = require('./hyperliquid.errors');

/**
 * SignalForge - Hyperliquid Market Service
 *
 * Provides market metadata: symbol list, leverage limits, decimal
 * precision, funding, and price snapshots. Every response is safe to
 * cache for a short window.
 */

let cachedMeta = null;
let cachedMetaAt = 0;
const META_TTL_MS = 5 * 60 * 1000;

function normalizeSymbol(symbol) {
  if (!symbol) {
    return null;
  }
  return String(symbol).trim().toUpperCase();
}

function mapUniverseEntry(entry) {
  return {
    symbol: entry.name,
    name: entry.name,
    szDecimals: entry.szDecimals,
    maxLeverage: entry.maxLeverage,
    onlyIsolated: entry.onlyIsolated === true,
    isDelisted: entry.isDelisted === true,
  };
}

async function loadMeta(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedMeta && now - cachedMetaAt < META_TTL_MS) {
    return cachedMeta;
  }
  const data = await hyperliquidClient.fetchMeta();
  const universe = Array.isArray(data?.universe) ? data.universe : [];
  cachedMeta = universe.map(mapUniverseEntry);
  cachedMetaAt = now;
  return cachedMeta;
}

async function loadMetaAndAssetCtxs(forceRefresh = false) {
  if (!forceRefresh && cachedMeta && Date.now() - cachedMetaAt < META_TTL_MS) {
    return cachedMeta;
  }
  const data = await hyperliquidClient.fetchMetaAndAssetCtxs();
  const universe = Array.isArray(data?.[0]?.universe) ? data[0].universe : [];
  const contexts = Array.isArray(data?.[1]) ? data[1] : [];

  cachedMeta = universe.map((entry, index) => ({
    ...mapUniverseEntry(entry),
    context: contexts[index] || null,
  }));
  cachedMetaAt = Date.now();
  return cachedMeta;
}

async function listMarkets() {
  return loadMeta();
}

async function findMarket(symbol) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) {
    throw new InvalidRequestError('symbol is required');
  }
  const markets = await loadMeta();
  const found = markets.find((market) => market.symbol === normalized);
  if (!found) {
    throw new MarketNotFoundError(`Market ${normalized} was not found on Hyperliquid`, {
      symbol: normalized,
    });
  }
  return found;
}

async function getMaxLeverage(symbol) {
  const market = await findMarket(symbol);
  return Math.min(market.maxLeverage || HYPERLIQUID_MAX_LEVERAGE, HYPERLIQUID_MAX_LEVERAGE);
}

async function getSizeDecimals(symbol) {
  const market = await findMarket(symbol);
  return market.szDecimals;
}

async function fetchAllMids() {
  return hyperliquidClient.fetchAllMids();
}

async function fetchMidPrice(symbol) {
  const mids = await fetchAllMids();
  const normalized = normalizeSymbol(symbol);
  const price = mids ? mids[normalized] : null;
  if (!price) {
    throw new MarketNotFoundError(`No mid price for ${normalized}`, { symbol: normalized });
  }
  return Number(price);
}

async function fetchL2Book(symbol, { depth = 20 } = {}) {
  const normalized = normalizeSymbol(symbol);
  return hyperliquidClient.fetchL2Book({ symbol: normalized, depth });
}

async function fetchCandles(symbol, { interval = '1m', startTime, endTime } = {}) {
  const normalized = normalizeSymbol(symbol);
  return hyperliquidClient.fetchCandleSnapshot({
    symbol: normalized,
    interval,
    startTime,
    endTime,
  });
}

async function fetchFundingHistory(symbol, { startTime, endTime } = {}) {
  const normalized = normalizeSymbol(symbol);
  return hyperliquidClient.fetchFundingHistory({
    symbol: normalized,
    startTime,
    endTime,
  });
}

async function syncMarketsToDatabase() {
  const markets = await loadMetaAndAssetCtxs(true);
  const persisted = [];
  for (const market of markets) {
    try {
      const record = await hyperliquidRepository.upsertMarket(null, {
        symbol: market.symbol,
        name: market.name,
        szDecimals: market.szDecimals,
        maxLeverage: market.maxLeverage,
        onlyIsolated: market.onlyIsolated,
        isDelisted: market.isDelisted,
        metadata: {
          context: market.context,
        },
      });
      persisted.push(record);
    } catch (_error) {
      // Continue on individual failure.
    }
  }
  return persisted;
}

async function describeMarket(symbol) {
  const market = await findMarket(symbol);
  let mid = null;
  try {
    mid = await fetchMidPrice(symbol);
  } catch (_error) {
    mid = null;
  }
  return {
    symbol: market.symbol,
    szDecimals: market.szDecimals,
    maxLeverage: market.maxLeverage,
    onlyIsolated: market.onlyIsolated,
    isDelisted: market.isDelisted,
    midPrice: mid,
  };
}

function clearCache() {
  cachedMeta = null;
  cachedMetaAt = 0;
}

module.exports = {
  normalizeSymbol,
  loadMeta,
  loadMetaAndAssetCtxs,
  listMarkets,
  findMarket,
  getMaxLeverage,
  getSizeDecimals,
  fetchAllMids,
  fetchMidPrice,
  fetchL2Book,
  fetchCandles,
  fetchFundingHistory,
  syncMarketsToDatabase,
  describeMarket,
  clearCache,
};