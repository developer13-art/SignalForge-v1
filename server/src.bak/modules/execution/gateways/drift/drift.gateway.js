'use strict';

const driftClient = require('./drift-client.service');
const driftOrder = require('./drift-order.service');
const driftPosition = require('./drift-position.service');
const driftMargin = require('./drift-margin.service');
const driftRepository = require('./drift.repository');

const {
  DRIFT_ERROR_CODES,
  DRIFT_METRICS,
  DRIFT_LOG_CONTEXT,
} = require('./drift.constants');

const {
  isDriftError,
} = require('./drift.errors');

/**
 * SignalForge - Drift Gateway
 *
 * Implements the perpetual gateway contract used by the execution
 * router. Drift is a tertiary perp gateway behind Hyperliquid.
 */

function resolveLogger() {
  if (global.__signalforgeLogger && typeof global.__signalforgeLogger.info === 'function') {
    return global.__signalforgeLogger;
  }
  return null;
}

function resolveMetrics() {
  if (global.__signalforgeMetrics && typeof global.__signalforgeMetrics.increment === 'function') {
    return global.__signalforgeMetrics;
  }
  return null;
}

async function order(params) {
  const started = Date.now();
  const result = await driftOrder.submitOrder(params);
  const elapsed = Date.now() - started;

  const metrics = resolveMetrics();
  if (metrics) {
    metrics.increment(DRIFT_METRICS.ORDERS, { gateway: 'drift' });
    metrics.observe?.(DRIFT_METRICS.LATENCY_MS, elapsed, { op: 'order' });
  }

  const logger = resolveLogger();
  if (logger) {
    logger.info(
      {
        context: DRIFT_LOG_CONTEXT,
        orderId: result.orderId,
        symbol: result.symbol,
        side: result.side,
        latencyMs: elapsed,
      },
      'Drift order submitted',
    );
  }

  return { ...result, latencyMs: elapsed };
}

async function cancel(params) {
  return driftOrder.cancelOrder(params);
}

async function modify(params) {
  return driftOrder.modifyOrder(params);
}

async function positions(userId) {
  return driftPosition.listOpenPositions(userId);
}

async function fetchPositions({ user }) {
  return driftPosition.fetchUserPositions({ user });
}

async function syncPositions({ userId, user }) {
  return driftPosition.syncUserPositions({ userId, user });
}

async function close(params) {
  return driftPosition.closePosition(params);
}

async function markets(options) {
  return driftRepository.listMarkets(options);
}

async function syncMarkets() {
  return driftMargin.syncMarketsFromDlob();
}

async function marketMargin(symbol) {
  return driftMargin.fetchMarketMarginRequirements(symbol);
}

async function setLeverage(params) {
  return driftMargin.prepareLeverageUpdate(params);
}

async function setMargin(params) {
  return driftMargin.prepareMarginUpdate(params);
}

async function orderbook({ market, depth }) {
  return driftClient.fetchOrderbook({ market, depth });
}

async function price({ market }) {
  return driftClient.fetchMarketPrice({ market });
}

async function health() {
  try {
    const markets = await driftRepository.listMarkets();
    return {
      gateway: 'drift',
      status: 'ok',
      markets: markets.length,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      gateway: 'drift',
      status: 'error',
      reason: error.message,
      checkedAt: new Date().toISOString(),
    };
  }
}

function isError(error) {
  return isDriftError(error);
}

module.exports = {
  order,
  cancel,
  modify,
  positions,
  fetchPositions,
  syncPositions,
  close,
  markets,
  syncMarkets,
  marketMargin,
  setLeverage,
  setMargin,
  orderbook,
  price,
  health,
  isError,
  ERROR_CODES: DRIFT_ERROR_CODES,
  REPOSITORY: driftRepository,
};