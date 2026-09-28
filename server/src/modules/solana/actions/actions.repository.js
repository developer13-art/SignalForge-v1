'use strict';

const { query, transaction } = require('../../../database/connection');
const { buildPagination } = require('../../../database/helpers/pagination.helper');
const { config } = require('./actions.config');
const { NotFoundError } = require('./actions.errors');

/**
 * SignalForge - Solana Actions Repository
 *
 * Data access layer for Solana Actions and Blinks. Every method accepts
 * primitive inputs and returns plain JavaScript objects. Transactions
 * are used wherever a single logical operation touches more than one
 * table to guarantee consistency without relying on application-level
 * rollback logic.
 */

const TABLES = Object.freeze({
  BLINKS: 'solana_blinks',
  BLINK_SHARES: 'solana_blink_shares',
  BLINK_CLICKS: 'solana_blink_clicks',
  BLINK_CONVERSIONS: 'solana_blink_conversions',
  BLINK_RECEIPTS: 'solana_blink_receipts',
});

async function createBlink(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.BLINKS} (
      id,
      provider_id,
      owner_user_id,
      template_type,
      status,
      title,
      description,
      label,
      message,
      icon_url,
      website,
      plan_id,
      referral_code,
      token_symbol,
      token_mint,
      amount,
      amount_decimals,
      chain_id,
      network,
      metadata,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      NOW(), NOW()
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.providerId || null,
    payload.ownerUserId || null,
    payload.templateType,
    payload.status || 'active',
    payload.title,
    payload.description,
    payload.label,
    payload.message || '',
    payload.iconUrl,
    payload.website || '',
    payload.planId || null,
    payload.referralCode || null,
    payload.tokenSymbol,
    payload.tokenMint,
    payload.amount,
    payload.amountDecimals,
    payload.chainId,
    payload.network,
    payload.metadata ? JSON.stringify(payload.metadata) : JSON.stringify({}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findBlinkById(blinkId) {
  const sql = `SELECT * FROM ${TABLES.BLINKS} WHERE id = $1 LIMIT 1;`;
  const result = await query(sql, [blinkId]);
  return result.rows[0] || null;
}

async function findBlinkByIdOrFail(blinkId) {
  const blink = await findBlinkById(blinkId);
  if (!blink) {
    throw new NotFoundError(`Blink ${blinkId} was not found`);
  }
  return blink;
}

async function findActiveBlinkByTemplateAndOwner({ templateType, ownerUserId, providerId }) {
  const conditions = ['template_type = $1', "status = 'active'"];
  const params = [templateType];

  if (ownerUserId) {
    params.push(ownerUserId);
    conditions.push(`owner_user_id = $${params.length}`);
  }

  if (providerId) {
    params.push(providerId);
    conditions.push(`provider_id = $${params.length}`);
  }

  const sql = `
    SELECT * FROM ${TABLES.BLINKS}
    WHERE ${conditions.join(' AND ')}
    ORDER BY updated_at DESC
    LIMIT 1;
  `;

  const result = await query(sql, params);
  return result.rows[0] || null;
}

async function listBlinks({ ownerUserId, providerId, templateType, status, page = 1, pageSize = 20 }) {
  const conditions = [];
  const params = [];

  if (ownerUserId) {
    params.push(ownerUserId);
    conditions.push(`owner_user_id = $${params.length}`);
  }
  if (providerId) {
    params.push(providerId);
    conditions.push(`provider_id = $${params.length}`);
  }
  if (templateType) {
    params.push(templateType);
    conditions.push(`template_type = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLES.BLINKS} ${whereClause};`;
  const countResult = await query(countSql, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(limit);
  params.push(offset);

  const listSql = `
    SELECT * FROM ${TABLES.BLINKS}
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length};
  `;

  const listResult = await query(listSql, params);

  return {
    items: listResult.rows,
    total,
    page,
    pageSize,
  };
}

async function updateBlinkStatus(blinkId, status) {
  const sql = `
    UPDATE ${TABLES.BLINKS}
    SET status = $2, updated_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;
  const result = await query(sql, [blinkId, status]);
  return result.rows[0] || null;
}

async function updateBlinkMetadata(blinkId, metadata) {
  const sql = `
    UPDATE ${TABLES.BLINKS}
    SET metadata = $2, updated_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;
  const result = await query(sql, [blinkId, JSON.stringify(metadata || {})]);
  return result.rows[0] || null;
}

async function recordBlinkShare(payload) {
  const sql = `
    INSERT INTO ${TABLES.BLINK_SHARES} (
      id,
      blink_id,
      channel,
      shared_by_user_id,
      target_url,
      user_agent,
      ip,
      metadata,
      created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, NOW()
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.blinkId,
    payload.channel,
    payload.sharedByUserId || null,
    payload.targetUrl || null,
    payload.userAgent || null,
    payload.ip || null,
    payload.metadata ? JSON.stringify(payload.metadata) : JSON.stringify({}),
  ];

  const result = await query(sql, params);
  return result.rows[0];
}

async function recordBlinkClick(payload) {
  const sql = `
    INSERT INTO ${TABLES.BLINK_CLICKS} (
      id,
      blink_id,
      channel,
      wallet,
      user_agent,
      ip,
      request_id,
      metadata,
      created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, NOW()
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.blinkId,
    payload.channel || null,
    payload.wallet || null,
    payload.userAgent || null,
    payload.ip || null,
    payload.requestId || null,
    payload.metadata ? JSON.stringify(payload.metadata) : JSON.stringify({}),
  ];

  const result = await query(sql, params);
  return result.rows[0];
}

async function createConversion(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.BLINK_CONVERSIONS} (
      id,
      blink_id,
      wallet,
      token_symbol,
      token_mint,
      amount,
      signature,
      reference,
      status,
      subscription_id,
      referral_relationship_id,
      provider_id,
      request_id,
      idempotency_key,
      metadata,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, NOW(), NOW()
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.blinkId,
    payload.wallet,
    payload.tokenSymbol,
    payload.tokenMint,
    payload.amount,
    payload.signature,
    payload.reference,
    payload.status || 'pending',
    payload.subscriptionId || null,
    payload.referralRelationshipId || null,
    payload.providerId || null,
    payload.requestId || null,
    payload.idempotencyKey || null,
    payload.metadata ? JSON.stringify(payload.metadata) : JSON.stringify({}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findConversionById(conversionId) {
  const sql = `SELECT * FROM ${TABLES.BLINK_CONVERSIONS} WHERE id = $1 LIMIT 1;`;
  const result = await query(sql, [conversionId]);
  return result.rows[0] || null;
}

async function findConversionBySignature(signature) {
  const sql = `SELECT * FROM ${TABLES.BLINK_CONVERSIONS} WHERE signature = $1 LIMIT 1;`;
  const result = await query(sql, [signature]);
  return result.rows[0] || null;
}

async function findConversionByIdempotencyKey(idempotencyKey) {
  if (!idempotencyKey) {
    return null;
  }
  const sql = `SELECT * FROM ${TABLES.BLINK_CONVERSIONS} WHERE idempotency_key = $1 LIMIT 1;`;
  const result = await query(sql, [idempotencyKey]);
  return result.rows[0] || null;
}

async function updateConversionStatus(conversionId, status, metadata = null) {
  const sql = `
    UPDATE ${TABLES.BLINK_CONVERSIONS}
    SET status = $2,
        metadata = COALESCE($3, metadata),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;
  const result = await query(sql, [
    conversionId,
    status,
    metadata ? JSON.stringify(metadata) : null,
  ]);
  return result.rows[0] || null;
}

async function createReceipt(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.BLINK_RECEIPTS} (
      id,
      blink_id,
      conversion_id,
      wallet,
      signature,
      reference,
      block_slot,
      block_time,
      confirmation_status,
      raw_payload,
      created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.blinkId,
    payload.conversionId || null,
    payload.wallet,
    payload.signature,
    payload.reference || null,
    payload.blockSlot || null,
    payload.blockTime || null,
    payload.confirmationStatus || 'processed',
    payload.rawPayload ? JSON.stringify(payload.rawPayload) : JSON.stringify({}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findReceiptBySignature(signature) {
  const sql = `SELECT * FROM ${TABLES.BLINK_RECEIPTS} WHERE signature = $1 LIMIT 1;`;
  const result = await query(sql, [signature]);
  return result.rows[0] || null;
}

async function listConversionsByBlink({ blinkId, status, page = 1, pageSize = 20 }) {
  const conditions = ['blink_id = $1'];
  const params = [blinkId];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM ${TABLES.BLINK_CONVERSIONS}
    WHERE ${conditions.join(' AND ')};
  `;
  const countResult = await query(countSql, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(limit);
  params.push(offset);

  const listSql = `
    SELECT * FROM ${TABLES.BLINK_CONVERSIONS}
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length};
  `;

  const listResult = await query(listSql, params);

  return {
    items: listResult.rows,
    total,
    page,
    pageSize,
  };
}

async function aggregateBlinkStats(blinkId) {
  const sql = `
    SELECT
      b.id,
      b.title,
      b.template_type,
      b.status,
      COALESCE(s.share_count, 0) AS share_count,
      COALESCE(c.click_count, 0) AS click_count,
      COALESCE(cv.conversion_count, 0) AS conversion_count,
      COALESCE(cv.confirmed_count, 0) AS confirmed_count,
      COALESCE(cv.total_amount, 0) AS total_amount,
      cv.last_conversion_at
    FROM ${TABLES.BLINKS} b
    LEFT JOIN (
      SELECT blink_id, COUNT(*)::int AS share_count
      FROM ${TABLES.BLINK_SHARES}
      GROUP BY blink_id
    ) s ON s.blink_id = b.id
    LEFT JOIN (
      SELECT blink_id, COUNT(*)::int AS click_count
      FROM ${TABLES.BLINK_CLICKS}
      GROUP BY blink_id
    ) c ON c.blink_id = b.id
    LEFT JOIN (
      SELECT
        blink_id,
        COUNT(*)::int AS conversion_count,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END)::int AS confirmed_count,
        COALESCE(SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END), 0) AS total_amount,
        MAX(created_at) AS last_conversion_at
      FROM ${TABLES.BLINK_CONVERSIONS}
      GROUP BY blink_id
    ) cv ON cv.blink_id = b.id
    WHERE b.id = $1
    LIMIT 1;
  `;

  const result = await query(sql, [blinkId]);
  return result.rows[0] || null;
}

async function aggregateOwnerStats(ownerUserId) {
  const sql = `
    SELECT
      COUNT(DISTINCT b.id)::int AS blink_count,
      COALESCE(SUM(CASE WHEN cv.status = 'confirmed' THEN 1 ELSE 0 END), 0)::int AS confirmed_conversions,
      COALESCE(SUM(CASE WHEN cv.status = 'confirmed' THEN cv.amount ELSE 0 END), 0) AS gross_amount,
      MAX(cv.created_at) AS last_conversion_at
    FROM ${TABLES.BLINKS} b
    LEFT JOIN ${TABLES.BLINK_CONVERSIONS} cv ON cv.blink_id = b.id
    WHERE b.owner_user_id = $1;
  `;

  const result = await query(sql, [ownerUserId]);
  return result.rows[0] || null;
}

async function withTransaction(handler) {
  return transaction(async (client) => handler(client));
}

async function isEnabled() {
  return Boolean(config.enabled);
}

module.exports = {
  TABLES,
  createBlink,
  findBlinkById,
  findBlinkByIdOrFail,
  findActiveBlinkByTemplateAndOwner,
  listBlinks,
  updateBlinkStatus,
  updateBlinkMetadata,
  recordBlinkShare,
  recordBlinkClick,
  createConversion,
  findConversionById,
  findConversionBySignature,
  findConversionByIdempotencyKey,
  updateConversionStatus,
  createReceipt,
  findReceiptBySignature,
  listConversionsByBlink,
  aggregateBlinkStats,
  aggregateOwnerStats,
  withTransaction,
  isEnabled,
};