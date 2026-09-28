'use strict';

const { query, transaction } = require('../../../../database/connection');
const { buildPagination } = require('../../../../database/helpers/pagination.helper');

/**
 * SignalForge - Drift Repository
 *
 * Persists Drift-specific state: markets, orders, fills, and
 * positions. Every submission produces at most one order row; fills
 * are appended as observed.
 */

const TABLES = Object.freeze({
  MARKETS: 'drift_markets',
  ORDERS: 'drift_orders',
  FILLS: 'drift_fills',
  POSITIONS: 'drift_positions',
});

async function upsertMarket(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.MARKETS} (
      symbol,
      market_index,
      market_type,
      base_asset_symbol,
      quote_asset_symbol,
      tick_size,
      step_size,
      min_order_size,
      max_leverage,
      initial_margin_ratio,
      maintenance_margin_ratio,
      is_active,
      metadata,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, NOW()
    )
    ON CONFLICT (symbol) DO UPDATE SET
      market_index = EXCLUDED.market_index,
      market_type = EXCLUDED.market_type,
      base_asset_symbol = EXCLUDED.base_asset_symbol,
      quote_asset_symbol = EXCLUDED.quote_asset_symbol,
      tick_size = EXCLUDED.tick_size,
      step_size = EXCLUDED.step_size,
      min_order_size = EXCLUDED.min_order_size,
      max_leverage = EXCLUDED.max_leverage,
      initial_margin_ratio = EXCLUDED.initial_margin_ratio,
      maintenance_margin_ratio = EXCLUDED.maintenance_margin_ratio,
      is_active = EXCLUDED.is_active,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING *;
  `;

  const params = [
    payload.symbol,
    payload.marketIndex,
    payload.marketType,
    payload.baseAssetSymbol || null,
    payload.quoteAssetSymbol || null,
    payload.tickSize || null,
    payload.stepSize || null,
    payload.minOrderSize || null,
    payload.maxLeverage || null,
    payload.initialMarginRatio || null,
    payload.maintenanceMarginRatio || null,
    payload.isActive !== false,
    JSON.stringify(payload.metadata || {}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findMarketBySymbol(symbol) {
  const sql = `SELECT * FROM ${TABLES.MARKETS} WHERE symbol = $1 LIMIT 1;`;
  const result = await query(sql, [symbol]);
  return result.rows[0] || null;
}

async function listMarkets({ marketType } = {}) {
  const conditions = ['is_active = TRUE'];
  const params = [];

  if (marketType) {
    params.push(marketType);
    conditions.push(`market_type = $${params.length}`);
  }

  const sql = `
    SELECT * FROM ${TABLES.MARKETS}
    WHERE ${conditions.join(' AND ')}
    ORDER BY symbol ASC;
  `;
  const result = await query(sql, params);
  return result.rows;
}

async function createOrder(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.ORDERS} (
      id,
      user_id,
      account_id,
      symbol,
      market_index,
      side,
      order_type,
      tif,
      size,
      price,
      trigger_price,
      reduce_only,
      leverage,
      status,
      exchange_response,
      error_message,
      submitted_at,
      confirmed_at,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW()
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.userId || null,
    payload.accountId || null,
    payload.symbol,
    payload.marketIndex || null,
    payload.side,
    payload.orderType,
    payload.tif || 'ioc',
    payload.size,
    payload.price || null,
    payload.triggerPrice || null,
    payload.reduceOnly === true,
    payload.leverage || null,
    payload.status || 'pending',
    payload.exchangeResponse ? JSON.stringify(payload.exchangeResponse) : null,
    payload.errorMessage || null,
    payload.submittedAt || null,
    payload.confirmedAt || null,
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findOrderById(id) {
  const sql = `SELECT * FROM ${TABLES.ORDERS} WHERE id = $1 LIMIT 1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

async function updateOrderStatus(id, updates) {
  const columnMap = {
    status: 'status',
    exchangeResponse: 'exchange_response',
    errorMessage: 'error_message',
    submittedAt: 'submitted_at',
    confirmedAt: 'confirmed_at',
  };

  const setClauses = ['updated_at = NOW()'];
  const params = [id];

  for (const [key, value] of Object.entries(updates || {})) {
    const column = columnMap[key];
    if (column && value !== undefined) {
      params.push(key === 'exchangeResponse' ? JSON.stringify(value) : value);
      setClauses.push(`${column} = $${params.length}`);
    }
  }

  const sql = `
    UPDATE ${TABLES.ORDERS}
    SET ${setClauses.join(', ')}
    WHERE id = $1
    RETURNING *;
  `;
  const result = await query(sql, params);
  return result.rows[0] || null;
}

async function listOrders({ userId, symbol, status, page = 1, pageSize = 20 }) {
  const conditions = [];
  const params = [];

  if (userId) {
    params.push(userId);
    conditions.push(`user_id = $${params.length}`);
  }
  if (symbol) {
    params.push(symbol);
    conditions.push(`symbol = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLES.ORDERS} ${whereClause};`;
  const countResult = await query(countSql, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(limit);
  params.push(offset);

  const listSql = `
    SELECT * FROM ${TABLES.ORDERS}
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length};
  `;
  const listResult = await query(listSql, params);

  return { items: listResult.rows, total, page, pageSize };
}

async function createFill(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.FILLS} (
      id,
      order_id,
      user_id,
      symbol,
      side,
      price,
      size,
      fee,
      closed_pnl,
      is_liquidation,
      direction,
      fill_time,
      created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, NOW()
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.orderId || null,
    payload.userId || null,
    payload.symbol,
    payload.side,
    payload.price,
    payload.size,
    payload.fee || null,
    payload.closedPnl || null,
    payload.isLiquidation === true,
    payload.direction || null,
    payload.fillTime || null,
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function listFills({ userId, symbol, page = 1, pageSize = 20 }) {
  const conditions = [];
  const params = [];

  if (userId) {
    params.push(userId);
    conditions.push(`user_id = $${params.length}`);
  }
  if (symbol) {
    params.push(symbol);
    conditions.push(`symbol = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLES.FILLS} ${whereClause};`;
  const countResult = await query(countSql, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(limit);
  params.push(offset);

  const listSql = `
    SELECT * FROM ${TABLES.FILLS}
    ${whereClause}
    ORDER BY fill_time DESC NULLS LAST, created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length};
  `;
  const listResult = await query(listSql, params);

  return { items: listResult.rows, total, page, pageSize };
}

async function upsertPosition(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.POSITIONS} (
      id,
      user_id,
      symbol,
      side,
      size,
      entry_price,
      mark_price,
      liquidation_price,
      leverage,
      margin_used,
      unrealized_pnl,
      realized_pnl,
      status,
      opened_at,
      closed_at,
      metadata,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      size = EXCLUDED.size,
      entry_price = EXCLUDED.entry_price,
      mark_price = EXCLUDED.mark_price,
      liquidation_price = EXCLUDED.liquidation_price,
      leverage = EXCLUDED.leverage,
      margin_used = EXCLUDED.margin_used,
      unrealized_pnl = EXCLUDED.unrealized_pnl,
      realized_pnl = EXCLUDED.realized_pnl,
      status = EXCLUDED.status,
      closed_at = EXCLUDED.closed_at,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.userId,
    payload.symbol,
    payload.side,
    payload.size,
    payload.entryPrice,
    payload.markPrice || null,
    payload.liquidationPrice || null,
    payload.leverage || null,
    payload.marginUsed || null,
    payload.unrealizedPnl || null,
    payload.realizedPnl || null,
    payload.status || 'open',
    payload.openedAt || null,
    payload.closedAt || null,
    JSON.stringify(payload.metadata || {}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function listOpenPositions(userId) {
  const sql = `
    SELECT * FROM ${TABLES.POSITIONS}
    WHERE user_id = $1 AND status = 'open'
    ORDER BY opened_at DESC NULLS LAST;
  `;
  const result = await query(sql, [userId]);
  return result.rows;
}

async function listPositions({ userId, status, page = 1, pageSize = 20 }) {
  const conditions = ['user_id = $1'];
  const params = [userId];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLES.POSITIONS} ${whereClause};`;
  const countResult = await query(countSql, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(limit);
  params.push(offset);

  const listSql = `
    SELECT * FROM ${TABLES.POSITIONS}
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length};
  `;
  const listResult = await query(listSql, params);

  return { items: listResult.rows, total, page, pageSize };
}

async function countOrders({ userId, status } = {}) {
  const conditions = [];
  const params = [];

  if (userId) {
    params.push(userId);
    conditions.push(`user_id = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT COUNT(*)::int AS total FROM ${TABLES.ORDERS} ${whereClause};`;
  const result = await query(sql, params);
  return result.rows[0]?.total || 0;
}

async function aggregateVolume({ userId, from, to } = {}) {
  const conditions = [];
  const params = [];

  if (userId) {
    params.push(userId);
    conditions.push(`user_id = $${params.length}`);
  }
  if (from) {
    params.push(from);
    conditions.push(`fill_time >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`fill_time <= $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT
      COUNT(*)::int AS total_fills,
      COALESCE(SUM(price * size), 0) AS total_notional,
      COALESCE(SUM(closed_pnl), 0) AS total_closed_pnl,
      COALESCE(SUM(fee), 0) AS total_fees
    FROM ${TABLES.FILLS}
    ${whereClause};
  `;
  const result = await query(sql, params);
  return result.rows[0] || {};
}

async function withTransaction(handler) {
  return transaction(async (client) => handler(client));
}

module.exports = {
  TABLES,
  upsertMarket,
  findMarketBySymbol,
  listMarkets,
  createOrder,
  findOrderById,
  updateOrderStatus,
  listOrders,
  createFill,
  listFills,
  upsertPosition,
  listOpenPositions,
  listPositions,
  countOrders,
  aggregateVolume,
  withTransaction,
};