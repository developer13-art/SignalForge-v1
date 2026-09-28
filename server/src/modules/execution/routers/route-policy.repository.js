'use strict';

const { query, transaction } = require('../../../database/connection');

/**
 * SignalForge - Route Policy Repository
 *
 * Persists per-user routing policies. A policy describes whether the
 * user prefers broker execution, DEX execution, perp execution, or an
 * automatic decision made by the router. At most one policy per user
 * can be marked as default.
 */

const TABLE = 'execution_route_policies';

async function upsertPolicy(client, payload) {
  const sql = `
    INSERT INTO ${TABLE} (
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

async function clearDefaultForUser(client, userId) {
  const sql = `
    UPDATE ${TABLE}
    SET is_default = FALSE, updated_at = NOW()
    WHERE user_id = $1 AND is_default = TRUE
    RETURNING id;
  `;
  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, [userId]);
  return result.rowCount;
}

async function findById(id) {
  const sql = `SELECT * FROM ${TABLE} WHERE id = $1 LIMIT 1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

async function findDefaultForUser(userId) {
  const sql = `
    SELECT * FROM ${TABLE}
    WHERE user_id = $1 AND is_default = TRUE
    ORDER BY updated_at DESC
    LIMIT 1;
  `;
  const result = await query(sql, [userId]);
  return result.rows[0] || null;
}

async function listForUser(userId) {
  const sql = `
    SELECT * FROM ${TABLE}
    WHERE user_id = $1
    ORDER BY is_default DESC, created_at DESC;
  `;
  const result = await query(sql, [userId]);
  return result.rows;
}

async function deleteById(id) {
  const sql = `DELETE FROM ${TABLE} WHERE id = $1 RETURNING id;`;
  const result = await query(sql, [id]);
  return Boolean(result.rows[0]);
}

async function countForUser(userId) {
  const sql = `SELECT COUNT(*)::int AS total FROM ${TABLE} WHERE user_id = $1;`;
  const result = await query(sql, [userId]);
  return result.rows[0]?.total || 0;
}

async function setDefault({ policyId, userId }) {
  return transaction(async (client) => {
    await clearDefaultForUser(client, userId);

    const sql = `
      UPDATE ${TABLE}
      SET is_default = TRUE, updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `;
    const result = await client.query(sql, [policyId, userId]);
    return result.rows[0] || null;
  });
}

async function withTransaction(handler) {
  return transaction(async (client) => handler(client));
}

module.exports = {
  TABLE,
  upsertPolicy,
  clearDefaultForUser,
  findById,
  findDefaultForUser,
  listForUser,
  deleteById,
  countForUser,
  setDefault,
  withTransaction,
};