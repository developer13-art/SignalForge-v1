'use strict';

const { query, transaction } = require('../../../database/connection');
const { buildPagination } = require('../../../database/helpers/pagination.helper');

/**
 * SignalForge - Execution Router Repository
 *
 * Persistence for routing policies and route decision logs. Route
 * decisions are immutable once written so the audit trail remains
 * linear.
 */

const TABLES = Object.freeze({
  POLICIES: 'execution_route_policies',
  ROUTES: 'execution_routes',
  LOGS: 'execution_route_logs',
});

async function upsertPolicy(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.POLICIES} (
      id,
      user_id,
      name,
      mode,
      fallback_behavior,
      preferred_gateway,
      preferred_instrument_class,
      allowed_gateways,
      blocked_gateways,
      max_slippage_bps,
      priority_fees_micro_lamports,
      is_default,
      metadata,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      mode = EXCLUDED.mode,
      fallback_behavior = EXCLUDED.fallback_behavior,
      preferred_gateway = EXCLUDED.preferred_gateway,
      preferred_instrument_class = EXCLUDED.preferred_instrument_class,
      allowed_gateways = EXCLUDED.allowed_gateways,
      blocked_gateways = EXCLUDED.blocked_gateways,
      max_slippage_bps = EXCLUDED.max_slippage_bps,
      priority_fees_micro_lamports = EXCLUDED.priority_fees_micro_lamports,
      is_default = EXCLUDED.is_default,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.userId,
    payload.name || 'default',
    payload.mode,
    payload.fallbackBehavior,
    payload.preferredGateway || null,
    payload.preferredInstrumentClass || null,
    payload.allowedGateways ? JSON.stringify(payload.allowedGateways) : null,
    payload.blockedGateways ? JSON.stringify(payload.blockedGateways) : null,
    payload.maxSlippageBps || null,
    payload.priorityFeesMicroLamports || null,
    payload.isDefault === true,
    JSON.stringify(payload.metadata || {}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findPolicyById(id) {
  const sql = `SELECT * FROM ${TABLES.POLICIES} WHERE id = $1 LIMIT 1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

async function findDefaultPolicyForUser(userId) {
  const sql = `
    SELECT * FROM ${TABLES.POLICIES}
    WHERE user_id = $1 AND is_default = TRUE
    ORDER BY updated_at DESC
    LIMIT 1;
  `;
  const result = await query(sql, [userId]);
  return result.rows[0] || null;
}

async function listPoliciesForUser(userId, { page = 1, pageSize = 20 } = {}) {
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLES.POLICIES} WHERE user_id = $1;`;
  const countResult = await query(countSql, [userId]);
  const total = countResult.rows[0]?.total || 0;

  const listSql = `
    SELECT * FROM ${TABLES.POLICIES}
    WHERE user_id = $1
    ORDER BY is_default DESC, created_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const listResult = await query(listSql, [userId, limit, offset]);

  return { items: listResult.rows, total, page, pageSize };
}

async function deletePolicy(id) {
  const sql = `DELETE FROM ${TABLES.POLICIES} WHERE id = $1 RETURNING id;`;
  const result = await query(sql, [id]);
  return Boolean(result.rows[0]);
}

async function createRoute(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.ROUTES} (
      id,
      user_id,
      provider_id,
      account_id,
      signal_id,
      trade_id,
      symbol,
      instrument_class,
      order_type,
      direction,
      resolved_gateway,
      fallback_gateway,
      status,
      reason,
      policy_id,
      policy_mode,
      request_id,
      attempt,
      latency_ms,
      metadata,
      created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW()
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.userId || null,
    payload.providerId || null,
    payload.accountId || null,
    payload.signalId || null,
    payload.tradeId || null,
    payload.symbol,
    payload.instrumentClass || null,
    payload.orderType || null,
    payload.direction || null,
    payload.resolvedGateway,
    payload.fallbackGateway || null,
    payload.status || 'resolved',
    payload.reason || null,
    payload.policyId || null,
    payload.policyMode || null,
    payload.requestId || null,
    payload.attempt || 1,
    payload.latencyMs || null,
    JSON.stringify(payload.metadata || {}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findRouteById(id) {
  const sql = `SELECT * FROM ${TABLES.ROUTES} WHERE id = $1 LIMIT 1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

async function listRoutes(filters = {}, { page = 1, pageSize = 20 } = {}) {
  const conditions = [];
  const params = [];

  if (filters.userId) {
    params.push(filters.userId);
    conditions.push(`user_id = $${params.length}`);
  }
  if (filters.providerId) {
    params.push(filters.providerId);
    conditions.push(`provider_id = $${params.length}`);
  }
  if (filters.symbol) {
    params.push(filters.symbol);
    conditions.push(`symbol = $${params.length}`);
  }
  if (filters.gateway) {
    params.push(filters.gateway);
    conditions.push(`resolved_gateway = $${params.length}`);
  }
  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLES.ROUTES} ${whereClause};`;
  const countResult = await query(countSql, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(limit);
  params.push(offset);

  const listSql = `
    SELECT * FROM ${TABLES.ROUTES}
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length};
  `;
  const listResult = await query(listSql, params);

  return { items: listResult.rows, total, page, pageSize };
}

async function createLog(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.LOGS} (
      id,
      route_id,
      action,
      message,
      payload,
      created_at
    ) VALUES (
      $1, $2, $3, $4, $5, NOW()
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.routeId || null,
    payload.action,
    payload.message || null,
    JSON.stringify(payload.payload || {}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function listLogsByRoute(routeId, { page = 1, pageSize = 50 } = {}) {
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLES.LOGS} WHERE route_id = $1;`;
  const countResult = await query(countSql, [routeId]);
  const total = countResult.rows[0]?.total || 0;

  const listSql = `
    SELECT * FROM ${TABLES.LOGS}
    WHERE route_id = $1
    ORDER BY created_at ASC
    LIMIT $2 OFFSET $3;
  `;
  const listResult = await query(listSql, [routeId, limit, offset]);

  return { items: listResult.rows, total, page, pageSize };
}

async function aggregateGatewayUsage({ from, to } = {}) {
  const conditions = [];
  const params = [];

  if (from) {
    params.push(from);
    conditions.push(`created_at >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`created_at <= $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT
      resolved_gateway AS gateway,
      COUNT(*)::int AS total,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END)::int AS resolved,
      SUM(CASE WHEN status = 'fallback' THEN 1 ELSE 0 END)::int AS fallback,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END)::int AS rejected,
      AVG(latency_ms) AS average_latency_ms
    FROM ${TABLES.ROUTES}
    ${whereClause}
    GROUP BY resolved_gateway
    ORDER BY total DESC;
  `;

  const result = await query(sql, params);
  return result.rows;
}

async function countRoutes({ userId, status } = {}) {
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
  const sql = `SELECT COUNT(*)::int AS total FROM ${TABLES.ROUTES} ${whereClause};`;
  const result = await query(sql, params);
  return result.rows[0]?.total || 0;
}

async function withTransaction(handler) {
  return transaction(async (client) => handler(client));
}

module.exports = {
  TABLES,
  upsertPolicy,
  findPolicyById,
  findDefaultPolicyForUser,
  listPoliciesForUser,
  deletePolicy,
  createRoute,
  findRouteById,
  listRoutes,
  createLog,
  listLogsByRoute,
  aggregateGatewayUsage,
  countRoutes,
  withTransaction,
};