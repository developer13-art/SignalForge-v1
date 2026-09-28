'use strict';

const crypto = require('crypto');

const { query } = require('../../../../database/connection');

const {
  ACTIONS_IDEMPOTENCY_KEY_MAX_LENGTH,
} = require('../actions.constants');

const { InvalidParameterError } = require('../actions.errors');

/**
 * SignalForge - Confirmation Idempotency Service
 *
 * Ensures that a given transaction signature is confirmed at most once
 * and that two separate delivery attempts for the same Blink payment
 * cannot both activate a subscription. The idempotency key is
 * persisted in the `solana_actions_idempotency` table with a unique
 * constraint so PostgreSQL itself enforces exactly-once semantics.
 */

const TABLE = 'solana_actions_idempotency';

function generateIdempotencyKey() {
  return `idem_${crypto.randomBytes(16).toString('hex')}`;
}

function normalizeKey(key) {
  if (!key) {
    return null;
  }
  if (typeof key !== 'string') {
    throw new InvalidParameterError('Idempotency key must be a string');
  }
  const trimmed = key.trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (trimmed.length > ACTIONS_IDEMPOTENCY_KEY_MAX_LENGTH) {
    throw new InvalidParameterError(
      `Idempotency key exceeds the maximum length of ${ACTIONS_IDEMPOTENCY_KEY_MAX_LENGTH}`,
      { length: trimmed.length },
    );
  }
  return trimmed;
}

async function reserve({ key, signature, blinkId, wallet }) {
  const normalized = normalizeKey(key) || `sig_${signature}`;

  const sql = `
    INSERT INTO ${TABLE} (key, signature, blink_id, wallet, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (key) DO NOTHING
    RETURNING *;
  `;

  const result = await query(sql, [normalized, signature, blinkId, wallet || null]);
  return {
    reserved: result.rowCount > 0,
    key: normalized,
    record: result.rows[0] || null,
  };
}

async function findByKey(key) {
  const normalized = normalizeKey(key);
  if (!normalized) {
    return null;
  }
  const sql = `SELECT * FROM ${TABLE} WHERE key = $1 LIMIT 1;`;
  const result = await query(sql, [normalized]);
  return result.rows[0] || null;
}

async function findBySignature(signature) {
  if (!signature) {
    return null;
  }
  const sql = `SELECT * FROM ${TABLE} WHERE signature = $1 LIMIT 1;`;
  const result = await query(sql, [signature]);
  return result.rows[0] || null;
}

async function attachConversion({ key, conversionId }) {
  const normalized = normalizeKey(key);
  if (!normalized) {
    throw new InvalidParameterError('Idempotency key is required');
  }
  const sql = `
    UPDATE ${TABLE}
    SET conversion_id = $2
    WHERE key = $1
    RETURNING *;
  `;
  const result = await query(sql, [normalized, conversionId]);
  return result.rows[0] || null;
}

async function release({ key }) {
  const normalized = normalizeKey(key);
  if (!normalized) {
    return false;
  }
  const sql = `DELETE FROM ${TABLE} WHERE key = $1 RETURNING id;`;
  const result = await query(sql, [normalized]);
  return Boolean(result.rows[0]);
}

async function cleanupExpired({ olderThanSeconds = 86400 } = {}) {
  const sql = `
    DELETE FROM ${TABLE}
    WHERE created_at < NOW() - ($1 || ' seconds')::interval
    RETURNING id;
  `;
  const result = await query(sql, [String(olderThanSeconds)]);
  return result.rowCount;
}

module.exports = {
  TABLE,
  generateIdempotencyKey,
  normalizeKey,
  reserve,
  findByKey,
  findBySignature,
  attachConversion,
  release,
  cleanupExpired,
};