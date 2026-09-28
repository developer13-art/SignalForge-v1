'use strict';

const raydiumClient = require('./raydium-client.service');
const raydiumQuote = require('./raydium-quote.service');
const raydiumSwap = require('./raydium-swap.service');
const raydiumPool = require('./raydium-pool.service');
const raydiumRepository = require('./raydium.repository');
const raydiumToken = require('./raydium-token.service');

const {
  RAYDIUM_ERROR_CODES,
  RAYDIUM_METRICS,
  RAYDIUM_LOG_CONTEXT,
} = require('./raydium.constants');

const {
  isRaydiumError,
} = require('./raydium.errors');

/**
 * SignalForge - Raydium Gateway
 *
 * Implements the DEX gateway contract used by the execution router.
 * Raydium is a fallback DEX for crypto spot execution when Jupiter is
 * unavailable or has no route.
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

async function quote(params) {
  const started = Date.now();
  const result = await raydiumQuote.fetchQuote(params);
  const elapsed = Date.now() - started;

  const metrics = resolveMetrics();
  if (metrics) {
    metrics.increment(RAYDIUM_METRICS.QUOTES, { gateway: 'raydium' });
    metrics.observe?.(RAYDIUM_METRICS.LATENCY_MS, elapsed, { op: 'quote' });
  }

  return {
    ...result,
    latencyMs: elapsed,
  };
}

async function buildSwap(params) {
  const started = Date.now();
  const result = await raydiumSwap.buildSwap(params);
  const elapsed = Date.now() - started;

  const metrics = resolveMetrics();
  if (metrics) {
    metrics.increment(RAYDIUM_METRICS.SWAPS, { gateway: 'raydium' });
    metrics.observe?.(RAYDIUM_METRICS.LATENCY_MS, elapsed, { op: 'swap' });
  }

  const logger = resolveLogger();
  if (logger) {
    logger.info(
      {
        context: RAYDIUM_LOG_CONTEXT,
        swapId: result.swapId,
        quoteId: result.quoteId,
        latencyMs: elapsed,
      },
      'Raydium swap built',
    );
  }

  return {
    ...result,
    latencyMs: elapsed,
  };
}

async function submit(params) {
  return raydiumSwap.submit(params);
}

async function confirm(params) {
  return raydiumSwap.confirm(params);
}

async function reconcile(params) {
  return raydiumSwap.reconcile(params);
}

async function resolveToken(symbol) {
  return raydiumToken.resolveMint(symbol);
}

async function resolveSymbol(mint) {
  return raydiumToken.resolveSymbol(mint);
}

async function listPools(filters) {
  return raydiumPool.listActivePools(filters);
}

async function syncPools(params) {
  return raydiumPool.syncPoolsToDatabase(params);
}

async function fetchPoolInfo(params) {
  return raydiumPool.fetchPoolInfo(params);
}

async function fetchPoolKeys(params) {
  return raydiumPool.fetchPoolKeys(params);
}

async function fetchPriorityFee() {
  return raydiumClient.fetchPriorityFee();
}

async function health() {
  try {
    const pools = await raydiumPool.loadPools({ page: 1, pageSize: 10 });
    return {
      gateway: 'raydium',
      status: 'ok',
      poolsSampled: pools.length,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      gateway: 'raydium',
      status: 'error',
      reason: error.message,
      checkedAt: new Date().toISOString(),
    };
  }
}

function isError(error) {
  return isRaydiumError(error);
}

module.exports = {
  quote,
  buildSwap,
  submit,
  confirm,
  reconcile,
  resolveToken,
  resolveSymbol,
  listPools,
  syncPools,
  fetchPoolInfo,
  fetchPoolKeys,
  fetchPriorityFee,
  health,
  isError,
  ERROR_CODES: RAYDIUM_ERROR_CODES,
  REPOSITORY: raydiumRepository,
};