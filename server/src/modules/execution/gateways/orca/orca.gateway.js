'use strict';

const orcaClient = require('./orca-client.service');
const orcaQuote = require('./orca-quote.service');
const orcaSwap = require('./orca-swap.service');
const orcaPool = require('./orca-pool.service');
const orcaToken = require('./orca-token.service');
const orcaRepository = require('./orca.repository');

const {
  ORCA_ERROR_CODES,
  ORCA_METRICS,
  ORCA_LOG_CONTEXT,
} = require('./orca.constants');

const {
  isOrcaError,
} = require('./orca.errors');

/**
 * SignalForge - Orca Gateway
 *
 * Implements the DEX gateway contract used by the execution router.
 * Orca is a tertiary DEX for crypto spot execution when Jupiter and
 * Raydium are unavailable.
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
  const result = await orcaQuote.fetchQuote(params);
  const elapsed = Date.now() - started;

  const metrics = resolveMetrics();
  if (metrics) {
    metrics.increment(ORCA_METRICS.QUOTES, { gateway: 'orca' });
    metrics.observe?.(ORCA_METRICS.LATENCY_MS, elapsed, { op: 'quote' });
  }

  return { ...result, latencyMs: elapsed };
}

async function buildSwap(params) {
  const started = Date.now();
  const result = await orcaSwap.buildSwap(params);
  const elapsed = Date.now() - started;

  const metrics = resolveMetrics();
  if (metrics) {
    metrics.increment(ORCA_METRICS.SWAPS, { gateway: 'orca' });
    metrics.observe?.(ORCA_METRICS.LATENCY_MS, elapsed, { op: 'swap' });
  }

  const logger = resolveLogger();
  if (logger) {
    logger.info(
      {
        context: ORCA_LOG_CONTEXT,
        swapId: result.swapId,
        quoteId: result.quoteId,
        latencyMs: elapsed,
      },
      'Orca swap built',
    );
  }

  return { ...result, latencyMs: elapsed };
}

async function submit(params) {
  return orcaSwap.submit(params);
}

async function confirm(params) {
  return orcaSwap.confirm(params);
}

async function reconcile(params) {
  return orcaSwap.reconcile(params);
}

async function resolveToken(symbol) {
  return orcaToken.resolveMint(symbol);
}

async function resolveSymbol(mint) {
  return orcaToken.resolveSymbol(mint);
}

async function listPools(filters) {
  return orcaPool.listActivePools(filters);
}

async function syncPools(params) {
  return orcaPool.syncPoolsToDatabase(params);
}

async function fetchPoolInfo(id) {
  return orcaPool.fetchPoolInfo(id);
}

async function fetchWhirlpools() {
  return orcaPool.fetchWhirlpools();
}

async function health() {
  try {
    const pools = await orcaPool.loadPools({ page: 1, pageSize: 10 });
    return {
      gateway: 'orca',
      status: 'ok',
      poolsSampled: pools.length,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      gateway: 'orca',
      status: 'error',
      reason: error.message,
      checkedAt: new Date().toISOString(),
    };
  }
}

function isError(error) {
  return isOrcaError(error);
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
  fetchWhirlpools,
  health,
  isError,
  ERROR_CODES: ORCA_ERROR_CODES,
  REPOSITORY: orcaRepository,
};