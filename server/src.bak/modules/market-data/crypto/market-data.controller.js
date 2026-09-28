'use strict';

const priceFeed = require('./price-feed.service');
const liquidity = require('./liquidity.service');
const volume = require('./volume.service');
const poolRegistry = require('./pool-registry.service');
const tokenMetadata = require('./token-metadata.service');
const cryptoSymbol = require('../../signals/crypto/crypto-symbol.service');

const {
  InvalidRequestError,
} = require('./market-data.errors');

/**
 * SignalForge - Crypto Market Data HTTP Controller
 *
 * Public and authenticated endpoints for prices, liquidity, volume,
 * pools, and token metadata. All read endpoints are safe to call from
 * the frontend.
 */

async function getPrice(req, res, next) {
  try {
    const symbol = req.params.symbol;
    const preferredSource = req.query.source || undefined;
    const result = await priceFeed.fetchPrice({ symbol, preferredSource });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getPricesBatch(req, res, next) {
  try {
    const symbols = Array.isArray(req.body?.symbols) ? req.body.symbols : null;
    if (!symbols) {
      throw new InvalidRequestError('symbols must be a non-empty array');
    }
    const result = await priceFeed.fetchPriceBatch({ symbols });
    return res.status(200).json({ results: result });
  } catch (error) {
    return next(error);
  }
}

async function getHistoricalPrice(req, res, next) {
  try {
    const symbol = req.params.symbol;
    const result = await priceFeed.fetchHistorical({
      symbol,
      from: req.query.from,
      to: req.query.to,
      page: Number.parseInt(req.query.page, 10) || 1,
      pageSize: Number.parseInt(req.query.pageSize, 10) || 100,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getVolatility(req, res, next) {
  try {
    const symbol = req.params.symbol;
    const result = await priceFeed.getVolatility({
      symbol,
      from: req.query.from,
      to: req.query.to,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getLiquidity(req, res, next) {
  try {
    const symbol = req.params.symbol;
    const result = await liquidity.fetchLiquidity({ symbol });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getPoolLiquidity(req, res, next) {
  try {
    const poolId = req.params.poolId;
    const result = await liquidity.fetchPoolLiquidity({ poolId });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getLiquidityTiers(_req, res, next) {
  try {
    const result = await liquidity.aggregateByTier();
    return res.status(200).json({ tiers: result });
  } catch (error) {
    return next(error);
  }
}

async function getVolume(req, res, next) {
  try {
    const symbol = req.params.symbol;
    const result = await volume.fetchVolume({
      symbol,
      window: req.query.window,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getVolumeSummary(req, res, next) {
  try {
    const symbol = req.params.symbol;
    const result = await volume.getVolumeSummary({ symbol });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function listTopVolume(req, res, next) {
  try {
    const window = req.query.window || '24h';
    const limit = Number.parseInt(req.query.limit, 10) || 20;
    const result = await volume.listTopByVolume({ window, limit });
    return res.status(200).json({ results: result });
  } catch (error) {
    return next(error);
  }
}

async function listPools(req, res, next) {
  try {
    const result = await poolRegistry.listPools({
      source: req.query.source,
      poolType: req.query.poolType,
      page: Number.parseInt(req.query.page, 10) || 1,
      pageSize: Number.parseInt(req.query.pageSize, 10) || 100,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function findPoolsByMints(req, res, next) {
  try {
    const baseMint = req.query.baseMint;
    const quoteMint = req.query.quoteMint;
    const source = req.query.source;
    const result = await poolRegistry.findPoolsByMints({ baseMint, quoteMint, source });
    return res.status(200).json({ pools: result });
  } catch (error) {
    return next(error);
  }
}

async function describePool(req, res, next) {
  try {
    const source = req.params.source;
    const address = req.params.address;
    const result = await poolRegistry.describePool({ source, address });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getToken(req, res, next) {
  try {
    const mint = req.params.mint;
    const result = await tokenMetadata.fetchMetadata({ mint });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function listTokens(req, res, next) {
  try {
    const result = await tokenMetadata.listTokens({
      page: Number.parseInt(req.query.page, 10) || 1,
      pageSize: Number.parseInt(req.query.pageSize, 10) || 100,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function listTokensByTag(req, res, next) {
  try {
    const tag = req.params.tag;
    const result = await tokenMetadata.listByTag(tag, {
      page: Number.parseInt(req.query.page, 10) || 1,
      pageSize: Number.parseInt(req.query.pageSize, 10) || 100,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function describeSymbol(req, res, next) {
  try {
    const symbol = req.params.symbol;
    const normalized = await cryptoSymbol.describeSymbol(symbol);
    return res.status(200).json(normalized);
  } catch (error) {
    return next(error);
  }
}

async function health(_req, res, next) {
  try {
    const sources = priceFeed.listAvailableSources();
    return res.status(200).json({
      status: 'ok',
      sources,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getPrice,
  getPricesBatch,
  getHistoricalPrice,
  getVolatility,
  getLiquidity,
  getPoolLiquidity,
  getLiquidityTiers,
  getVolume,
  getVolumeSummary,
  listTopVolume,
  listPools,
  findPoolsByMints,
  describePool,
  getToken,
  listTokens,
  listTokensByTag,
  describeSymbol,
  health,
};