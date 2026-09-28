'use strict';

const hyperliquidClient = require('./hyperliquid-client.service');
const hyperliquidRepository = require('./hyperliquid.repository');

const {
  InvalidRequestError,
} = require('./hyperliquid.errors');

/**
 * SignalForge - Hyperliquid Position Service
 *
 * Reads user positions from Hyperliquid and reconciles them with the
 * SignalForge position table. Reconciliation is idempotent so it can
 * run on every heartbeat without duplicating rows.
 */

function mapPositionFromClearinghouse(symbol, entry) {
  if (!entry || !entry.position) {
    return null;
  }

  const position = entry.position;

  return {
    symbol: position.coin || symbol,
    side: position.szi && Number(position.szi) < 0 ? 'SHORT' : 'LONG',
    size: Math.abs(Number(position.szi || 0)),
    entryPrice: Number(position.entryPx || 0),
    markPrice: null,
    liquidationPrice: Number(position.liquidationPx || 0) || null,
    leverage: position.leverage ? position.leverage.value : null,
    marginUsed: Number(position.marginUsed || 0),
    unrealizedPnl: Number(position.unrealizedPnl || 0),
    realizedPnl: Number(position.cumFunding ? -Number(position.cumFunding.sinceOpen || 0) : 0) || null,
    status: Math.abs(Number(position.szi || 0)) > 0 ? 'open' : 'closed',
    openedAt: position.time ? new Date(position.time).toISOString() : null,
    closedAt: null,
    metadata: {
      cumFunding: position.cumFunding || null,
      returnOnEquity: position.returnOnEquity || null,
      isIsolated: position.leverage ? position.leverage.type === 'isolated' : false,
    },
  };
}

function extractPositions(clearinghouseState) {
  if (!clearinghouseState || !Array.isArray(clearinghouseState.assetPositions)) {
    return [];
  }
  const result = [];
  for (const entry of clearinghouseState.assetPositions) {
    const mapped = mapPositionFromClearinghouse(entry?.position?.coin, entry);
    if (mapped) {
      result.push(mapped);
    }
  }
  return result;
}

async function fetchUserPositions({ user }) {
  if (!user) {
    throw new InvalidRequestError('user is required');
  }
  const state = await hyperliquidClient.fetchClearinghouseState({ user });
  return {
    marginSummary: state?.marginSummary || null,
    crossMarginSummary: state?.crossMarginSummary || null,
    withdrawable: state?.withdrawable || null,
    positions: extractPositions(state),
    raw: state,
  };
}

async function syncUserPositions({ userId, user }) {
  const { positions } = await fetchUserPositions({ user });

  const persisted = [];
  for (const position of positions) {
    const id = `${userId}_${position.symbol}`;
    try {
      const record = await hyperliquidRepository.upsertPosition(null, {
        id,
        userId,
        symbol: position.symbol,
        side: position.side,
        size: position.size,
        entryPrice: position.entryPrice,
        markPrice: position.markPrice,
        liquidationPrice: position.liquidationPrice,
        leverage: position.leverage,
        marginUsed: position.marginUsed,
        unrealizedPnl: position.unrealizedPnl,
        realizedPnl: position.realizedPnl,
        status: position.status,
        openedAt: position.openedAt,
        closedAt: position.closedAt,
        metadata: position.metadata,
      });
      persisted.push(record);
    } catch (_error) {
      // Continue on individual failure.
    }
  }

  return {
    userId,
    user,
    positionsSynced: persisted.length,
    records: persisted,
  };
}

async function listOpenPositions(userId) {
  return hyperliquidRepository.listOpenPositions(userId);
}

async function listPositions({ userId, status, page, pageSize }) {
  return hyperliquidRepository.listPositions({ userId, status, page, pageSize });
}

async function closePosition({ userId, symbol, side, size, signer, price }) {
  if (!symbol) {
    throw new InvalidRequestError('symbol is required');
  }
  const orderService = require('./hyperliquid-order.service');
  return orderService.submitOrder({
    userId,
    symbol,
    side: side === 'LONG' ? 'SELL' : 'BUY',
    size,
    price,
    orderType: 'market',
    reduceOnly: true,
    signer,
  });
}

function summarizePositions(positions) {
  if (!Array.isArray(positions) || positions.length === 0) {
    return {
      count: 0,
      totalSize: 0,
      totalMarginUsed: 0,
      totalUnrealizedPnl: 0,
    };
  }
  return positions.reduce(
    (acc, position) => {
      acc.count += 1;
      acc.totalSize += Number(position.size || 0);
      acc.totalMarginUsed += Number(position.margin_used || position.marginUsed || 0);
      acc.totalUnrealizedPnl += Number(position.unrealized_pnl || position.unrealizedPnl || 0);
      return acc;
    },
    { count: 0, totalSize: 0, totalMarginUsed: 0, totalUnrealizedPnl: 0 },
  );
}

module.exports = {
  mapPositionFromClearinghouse,
  extractPositions,
  fetchUserPositions,
  syncUserPositions,
  listOpenPositions,
  listPositions,
  closePosition,
  summarizePositions,
};