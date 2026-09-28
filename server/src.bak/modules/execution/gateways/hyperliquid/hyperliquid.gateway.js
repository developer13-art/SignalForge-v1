'use strict';

const crypto = require('crypto');

const hyperliquidClient = require('./hyperliquid-client.service');
const hyperliquidMarket = require('./hyperliquid-market.service');
const hyperliquidOrder = require('./hyperliquid-order.service');
const hyperliquidPosition = require('./hyperliquid-position.service');
const hyperliquidRepository = require('./hyperliquid.repository');
const hyperliquidWs = require('./hyperliquid-ws.service');

const {
  HYPERLIQUID_ERROR_CODES,
  HYPERLIQUID_METRICS,
  HYPERLIQUID_LOG_CONTEXT,
} = require('./hyperliquid.constants');

const {
  isHyperliquidError,
} = require('./hyperliquid.errors');

/**
 * SignalForge - Hyperliquid Gateway
 *
 * The Hyperliquid gateway implements the perpetual gateway contract
 * used by the execution router. It exposes quote-less order submission
 * (perpetuals price directly on the mid), cancel, modify, position
 * reconciliation, and market data.
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

function generateRequestId() {
  return `hlr_${crypto.randomBytes(8).toString('hex')}`;
}

async function order(params) {
  const started = Date.now();
  const requestId = generateRequestId();

  const result = await hyperliquidOrder.submitOrder({
    ...params,
    requestId,
  });

  const elapsed = Date.now() - started;

  const metrics = resolveMetrics();
  if (metrics) {
    metrics.increment(HYPERLIQUID_METRICS.ORDERS, { gateway: 'hyperliquid' });
    metrics.observe?.(HYPERLIQUID_METRICS.LATENCY_MS, elapsed, { op: 'order' });
  }

  const logger = resolveLogger();
  if (logger) {
    logger.info(
      {
        context: HYPERLIQUID_LOG_CONTEXT,
        orderId: result.orderId,
        symbol: result.symbol,
        side: result.side,
        latencyMs: elapsed,
      },
      'Hyperliquid order submitted',
    );
  }

  return {
    ...result,
    requestId,
    latencyMs: elapsed,
  };
}

async function cancel(params) {
  return hyperliquidOrder.cancelOrder(params);
}

async function modify(params) {
  return hyperliquidOrder.modifyOrder(params);
}

async function positions(userId) {
  return hyperliquidPosition.listOpenPositions(userId);
}

async function fetchPositions({ user }) {
  return hyperliquidPosition.fetchUserPositions({ user });
}

async function syncPositions({ userId, user }) {
  return hyperliquidPosition.syncUserPositions({ userId, user });
}

async function close(params) {
  return hyperliquidPosition.closePosition(params);
}

async function markets() {
  return hyperliquidMarket.listMarkets();
}

async function market(symbol) {
  return hyperliquidMarket.describeMarket(symbol);
}

async function midPrice(symbol) {
  return hyperliquidMarket.fetchMidPrice(symbol);
}

async function candles(symbol, options) {
  return hyperliquidMarket.fetchCandles(symbol, options);
}

async function fundingHistory(symbol, options) {
  return hyperliquidMarket.fetchFundingHistory(symbol, options);
}

async function syncMarkets() {
  return hyperliquidMarket.syncMarketsToDatabase();
}

function subscribeUserEvents({ user, handler }) {
  const fillsKey = hyperliquidWs.subscribeToUserFills({ user, handler });
  const orderKey = hyperliquidWs.subscribeToOrderUpdates({ user, handler });
  return { fillsKey, orderKey };
}

function unsubscribeEvents({ fillsKey, orderKey, handler }) {
  if (fillsKey) {
    hyperliquidWs.unsubscribe({ key: fillsKey, subscriber: handler || 'default' });
  }
  if (orderKey) {
    hyperliquidWs.unsubscribe({ key: orderKey, subscriber: handler || 'default' });
  }
}

async function health() {
  try {
    const meta = await hyperliquidMarket.loadMeta();
    const ws = hyperliquidWs.status();
    return {
      gateway: 'hyperliquid',
      status: 'ok',
      markets: meta.length,
      websocket: ws,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      gateway: 'hyperliquid',
      status: 'error',
      reason: error.message,
      checkedAt: new Date().toISOString(),
    };
  }
}

function isError(error) {
  return isHyperliquidError(error);
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
  market,
  midPrice,
  candles,
  fundingHistory,
  syncMarkets,
  subscribeUserEvents,
  unsubscribeEvents,
  health,
  isError,
  generateRequestId,
  ERROR_CODES: HYPERLIQUID_ERROR_CODES,
  WS: hyperliquidWs,
  REPOSITORY: hyperliquidRepository,
  CLIENT: hyperliquidClient,
};