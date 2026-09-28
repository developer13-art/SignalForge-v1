'use strict';

const driftClient = require('./drift-client.service');
const driftRepository = require('./drift.repository');

const {
  DRIFT_DEFAULT_LEVERAGE,
  DRIFT_MIN_LEVERAGE,
  DRIFT_MAX_LEVERAGE,
  DRIFT_MARKET_TYPES,
} = require('./drift.constants');

const {
  InvalidRequestError,
  MarketNotFoundError,
  LeverageFailedError,
  MarginFailedError,
} = require('./drift.errors');

/**
 * SignalForge - Drift Margin Service
 *
 * Handles leverage and margin updates for Drift positions. This
 * service does not sign transactions; it validates intent, prepares
 * the parameters the signer needs, and delegates to the signer for
 * the actual on-chain call.
 */

function validateLeverage(leverage) {
  if (leverage === undefined || leverage === null || leverage === '') {
    return DRIFT_DEFAULT_LEVERAGE;
  }
  const numeric = Number(leverage);
  if (!Number.isFinite(numeric)) {
    throw new InvalidRequestError('leverage must be a finite number');
  }
  if (numeric < DRIFT_MIN_LEVERAGE || numeric > DRIFT_MAX_LEVERAGE) {
    throw new InvalidRequestError(
      `leverage must be between ${DRIFT_MIN_LEVERAGE} and ${DRIFT_MAX_LEVERAGE}`,
      { leverage: numeric },
    );
  }
  return Math.round(numeric);
}

function normalizeMarketSymbol(symbol) {
  if (!symbol) {
    throw new InvalidRequestError('market symbol is required');
  }
  return String(symbol).trim().toUpperCase();
}

async function findMarket(symbol) {
  const normalized = normalizeMarketSymbol(symbol);
  const market = await driftRepository.findMarketBySymbol(normalized);
  if (!market) {
    throw new MarketNotFoundError(`Market ${normalized} was not found`, { symbol: normalized });
  }
  return market;
}

async function prepareLeverageUpdate({ user, marketSymbol, leverage, signer }) {
  if (!user) {
    throw new InvalidRequestError('user is required');
  }
  if (!signer) {
    throw new InvalidRequestError('signer is required');
  }
  const market = await findMarket(marketSymbol);
  const validatedLeverage = validateLeverage(leverage);

  try {
    const result = await signer.updateLeverage({
      user,
      marketIndex: market.market_index,
      leverage: validatedLeverage,
    });

    return {
      marketSymbol: market.symbol,
      marketIndex: market.market_index,
      leverage: validatedLeverage,
      signature: result?.signature || null,
      result,
    };
  } catch (error) {
    throw new LeverageFailedError('Failed to update leverage on Drift', {
      reason: error.message,
      marketSymbol: market.symbol,
    });
  }
}

async function prepareMarginUpdate({ user, marketSymbol, amount, signer }) {
  if (!user) {
    throw new InvalidRequestError('user is required');
  }
  if (!signer) {
    throw new InvalidRequestError('signer is required');
  }
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) {
    throw new InvalidRequestError('amount must be a finite number');
  }
  const market = await findMarket(marketSymbol);

  try {
    const result = await signer.updateMargin({
      user,
      marketIndex: market.market_index,
      amount: numeric,
    });

    return {
      marketSymbol: market.symbol,
      marketIndex: market.market_index,
      amount: numeric,
      signature: result?.signature || null,
      result,
    };
  } catch (error) {
    throw new MarginFailedError('Failed to update margin on Drift', {
      reason: error.message,
      marketSymbol: market.symbol,
    });
  }
}

async function fetchMarketMarginRequirements(symbol) {
  const market = await findMarket(symbol);
  return {
    symbol: market.symbol,
    maxLeverage: market.max_leverage || DRIFT_MAX_LEVERAGE,
    initialMarginRatio: market.initial_margin_ratio,
    maintenanceMarginRatio: market.maintenance_margin_ratio,
    tickSize: market.tick_size,
    stepSize: market.step_size,
    minOrderSize: market.min_order_size,
    marketType: market.market_type || DRIFT_MARKET_TYPES.PERP,
  };
}

async function syncMarketsFromDlob() {
  const response = await driftClient.fetchMarkets();
  const markets = Array.isArray(response)
    ? response
    : Array.isArray(response?.markets)
    ? response.markets
    : [];

  const persisted = [];
  for (const market of markets) {
    try {
      const record = await driftRepository.upsertMarket(null, {
        symbol: market.symbol || market.name,
        marketIndex: market.marketIndex || market.market_index,
        marketType: market.type || DRIFT_MARKET_TYPES.PERP,
        baseAssetSymbol: market.baseAssetSymbol || null,
        quoteAssetSymbol: market.quoteAssetSymbol || 'USD',
        tickSize: market.tickSize || null,
        stepSize: market.stepSize || null,
        minOrderSize: market.minOrderSize || null,
        maxLeverage: market.maxLeverage || null,
        initialMarginRatio: market.initialMarginRatio || null,
        maintenanceMarginRatio: market.maintenanceMarginRatio || null,
        isActive: market.isActive !== false,
        metadata: { raw: market },
      });
      persisted.push(record);
    } catch (_error) {
      // Continue on individual failure.
    }
  }

  return persisted;
}

function describeMarginHealth({ balance, marginUsed, unrealizedPnl }) {
  const free = Number(balance || 0) - Number(marginUsed || 0);
  const equity = Number(balance || 0) + Number(unrealizedPnl || 0);
  const marginRatio = equity > 0 ? Number(marginUsed || 0) / equity : 0;

  return {
    balance: Number(balance || 0),
    marginUsed: Number(marginUsed || 0),
    unrealizedPnl: Number(unrealizedPnl || 0),
    freeMargin: free,
    equity,
    marginRatio,
    status: marginRatio > 0.8 ? 'critical' : marginRatio > 0.5 ? 'warning' : 'healthy',
  };
}

module.exports = {
  validateLeverage,
  normalizeMarketSymbol,
  findMarket,
  prepareLeverageUpdate,
  prepareMarginUpdate,
  fetchMarketMarginRequirements,
  syncMarketsFromDlob,
  describeMarginHealth,
};