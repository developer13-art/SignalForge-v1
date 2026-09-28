'use strict';

const driftClient = require('./drift-client.service');
const driftRepository = require('./drift.repository');

const {
  InvalidRequestError,
} = require('./drift.errors');

/**
 * SignalForge - Drift Position Service
 *
 * Reads user positions from Drift and reconciles them with the
 * SignalForge position table. Reconciliation is idempotent so it can
 * run on every heartbeat without duplicating rows.
 */

function mapPositionEntry(entry) {
  if (!entry) {
    return null;
  }

  const size = Number(entry.size || entry.baseAssetAmount || 0);
  const signedSize = entry.direction === 'short' || size < 0 ? -Math.abs(size) : Math.abs(size);

  return {
    symbol: entry.symbol || entry.market || null,
    side: signedSize >= 0 ? 'LONG' : 'SHORT',
    size: Math.abs(signedSize),
    entryPrice: Number(entry.entryPrice || entry.entry_price || 0),
    markPrice: Number(entry.markPrice || entry.mark_price || 0) || null,
    liquidationPrice: Number(entry.liquidationPrice || entry.liquidation_price || 0) || null,
    leverage: Number(entry.leverage || 0) || null,
    marginUsed: Number(entry.marginUsed || entry.margin_used || 0) || null,
    unrealizedPnl: Number(entry.unrealizedPnl || entry.unrealized_pnl || 0) || null,
    realizedPnl: Number(entry.realizedPnl || entry.realized_pnl || 0) || null,
    status: Math.abs(signedSize) > 0 ? 'open' : 'closed',
    openedAt: entry.openedAt || entry.opened_at || null,
    closedAt: entry.closedAt || entry.closed_at || null,
    metadata: {
      openOrders: entry.openOrders || 0,
      marginRatio: entry.marginRatio || null,
    },
  };
}

async function fetchUserPositions({ user }) {
  if (!user) {
    throw new InvalidRequestError('user is required');
  }
  const response = await driftClient.request('/positions', {
    method: 'GET',
    query: { user },
  });

  const raw = Array.isArray(response)
    ? response
    : Array.isArray(response?.positions)
    ? response.positions
    : [];

  return {
    positions: raw.map(mapPositionEntry).filter(Boolean),
    raw: response,
  };
}

async function syncUserPositions({ userId, user }) {
  const { positions } = await fetchUserPositions({ user });

  const persisted = [];
  for (const position of positions) {
    const id = `${userId}_${position.symbol}`;
    try {
      const record = await driftRepository.upsertPosition(null, {
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
  return driftRepository.listOpenPositions(userId);
}

async function listPositions({ userId, status, page, pageSize }) {
  return driftRepository.listPositions({ userId, status, page, pageSize });
}

async function closePosition({ userId, symbol, side, size, signer, price }) {
  if (!symbol) {
    throw new InvalidRequestError('symbol is required');
  }
  const orderService = require('./drift-order.service');
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
  mapPositionEntry,
  fetchUserPositions,
  syncUserPositions,
  listOpenPositions,
  listPositions,
  closePosition,
  summarizePositions,
};