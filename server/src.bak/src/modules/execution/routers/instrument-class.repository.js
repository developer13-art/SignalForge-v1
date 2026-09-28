'use strict';

const { query, transaction } = require('../../../database/connection');

/**
 * SignalForge - Instrument Class Repository
 *
 * Persists a curated registry of supported instruments per gateway.
 * The repository is consulted by the router when classifying symbols
 * and when deciding which gateway can serve a given symbol.
 */

const TABLE = 'execution_instruments';

async function upsertInstrument(client, payload) {
  const sql = `
    INSERT INTO ${TABLE} (
      id,
      symbol,
      instrument_class,
      gateway,
      is_enabled,
      min_amount,
      max_amount,
      price_precision,
      quantity_precision,
      metadata,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
    )
    ON CONFLICT (symbol, gateway) DO UPDATE SET
      instrument_class = EXCLUDED.instrument_class,
      is_enabled = EXCLUDED.is_enabled,
      min_amount = EXCLUDED.min_amount,
      max_amount = EXCLUDED.max_amount,
      price_precision = EXCLUDED.price_precision,
      quantity_precision = EXCLUDED.quantity_precision,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.symbol,
    payload.instrumentClass,
    payload.gateway,
    payload.isEnabled !== false,
    payload.minAmount || null,
    payload.maxAmount || null,
    payload.pricePrecision || null,
    payload.quantityPrecision || null,
    JSON.stringify(payload.metadata || {}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findInstrument({ symbol, gateway }) {
  const sql = `
    SELECT * FROM ${TABLE}
    WHERE symbol = $1 AND gateway = $2 AND is_enabled = TRUE
    LIMIT 1;
  `;
  const result = await query(sql, [symbol, gateway]);
  return result.rows[0] || null;
}

async function listInstrumentsByGateway(gateway) {
  const sql = `
    SELECT * FROM ${TABLE}
    WHERE gateway = $1 AND is_enabled = TRUE
    ORDER BY symbol ASC;
  `;
  const result = await query(sql, [gateway]);
  return result.rows;
}

async function listInstrumentsByClass(instrumentClass) {
  const sql = `
    SELECT * FROM ${TABLE}
    WHERE instrument_class = $1 AND is_enabled = TRUE
    ORDER BY symbol ASC;
  `;
  const result = await query(sql, [instrumentClass]);
  return result.rows;
}

async function findEnabledGatewaysForSymbol(symbol) {
  const sql = `
    SELECT gateway, instrument_class, min_amount, max_amount, price_precision, quantity_precision
    FROM ${TABLE}
    WHERE symbol = $1 AND is_enabled = TRUE
    ORDER BY gateway ASC;
  `;
  const result = await query(sql, [symbol]);
  return result.rows;
}

async function listAllEnabled() {
  const sql = `
    SELECT * FROM ${TABLE}
    WHERE is_enabled = TRUE
    ORDER BY instrument_class ASC, symbol ASC;
  `;
  const result = await query(sql);
  return result.rows;
}

async function disableInstrument({ symbol, gateway }) {
  const sql = `
    UPDATE ${TABLE}
    SET is_enabled = FALSE, updated_at = NOW()
    WHERE symbol = $1 AND gateway = $2
    RETURNING id;
  `;
  const result = await query(sql, [symbol, gateway]);
  return Boolean(result.rows[0]);
}

async function countInstruments({ gateway, instrumentClass } = {}) {
  const conditions = ['is_enabled = TRUE'];
  const params = [];

  if (gateway) {
    params.push(gateway);
    conditions.push(`gateway = $${params.length}`);
  }
  if (instrumentClass) {
    params.push(instrumentClass);
    conditions.push(`instrument_class = $${params.length}`);
  }

  const sql = `SELECT COUNT(*)::int AS total FROM ${TABLE} WHERE ${conditions.join(' AND ')};`;
  const result = await query(sql, params);
  return result.rows[0]?.total || 0;
}

async function withTransaction(handler) {
  return transaction(async (client) => handler(client));
}

module.exports = {
  TABLE,
  upsertInstrument,
  findInstrument,
  listInstrumentsByGateway,
  listInstrumentsByClass,
  findEnabledGatewaysForSymbol,
  listAllEnabled,
  disableInstrument,
  countInstruments,
  withTransaction,
};