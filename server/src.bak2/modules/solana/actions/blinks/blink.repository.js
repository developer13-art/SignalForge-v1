'use strict';

const { query, transaction } = require('../../../../database/connection');
const { buildPagination } = require('../../../../database/helpers/pagination.helper');

/**
 * SignalForge - Blink Repository
 *
 * Specialized data-access methods for Blink lifecycle, templates, and
 * analytics. Complements the generic repository in the parent module
 * without duplicating its logic.
 */

const TABLES = Object.freeze({
  BLINKS: 'solana_blinks',
  BLINK_TEMPLATES: 'solana_blink_templates',
  BLINK_SHARES: 'solana_blink_shares',
  BLINK_CLICKS: 'solana_blink_clicks',
  BLINK_CONVERSIONS: 'solana_blink_conversions',
});

async function insertBlinkTemplate(client, payload) {
  const sql = `
    INSERT INTO ${TABLES.BLINK_TEMPLATES} (
      id,
      owner_user_id,
      provider_id,
      template_type,
      name,
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
      metadata,
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
    payload.ownerUserId || null,
    payload.providerId || null,
    payload.templateType,
    payload.name,
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
    payload.metadata ? JSON.stringify(payload.metadata) : JSON.stringify({}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findTemplateById(templateId) {
  const sql = `SELECT * FROM ${TABLES.BLINK_TEMPLATES} WHERE id = $1 LIMIT 1;`;
  const result = await query(sql, [templateId]);
  return result.rows[0] || null;
}

async function listTemplates({ ownerUserId, providerId, templateType, page = 1, pageSize = 20 }) {
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

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLES.BLINK_TEMPLATES} ${whereClause};`;
  const countResult = await query(countSql, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(limit);
  params.push(offset);

  const listSql = `
    SELECT * FROM ${TABLES.BLINK_TEMPLATES}
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

async function updateTemplate(templateId, updates) {
  const allowedColumns = [
    'name',
    'title',
    'description',
    'label',
    'message',
    'icon_url',
    'website',
    'plan_id',
    'referral_code',
    'token_symbol',
    'token_mint',
    'amount',
    'amount_decimals',
    'metadata',
  ];

  const setClauses = [];
  const params = [templateId];

  for (const [key, value] of Object.entries(updates || {})) {
    const column = key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
    if (allowedColumns.includes(column) && value !== undefined) {
      params.push(key === 'metadata' ? JSON.stringify(value) : value);
      setClauses.push(`${column} = $${params.length}`);
    }
  }

  if (setClauses.length === 0) {
    return findTemplateById(templateId);
  }

  setClauses.push('updated_at = NOW()');

  const sql = `
    UPDATE ${TABLES.BLINK_TEMPLATES}
    SET ${setClauses.join(', ')}
    WHERE id = $1
    RETURNING *;
  `;

  const result = await query(sql, params);
  return result.rows[0] || null;
}

async function deleteTemplate(templateId) {
  const sql = `DELETE FROM ${TABLES.BLINK_TEMPLATES} WHERE id = $1 RETURNING id;`;
  const result = await query(sql, [templateId]);
  return Boolean(result.rows[0]);
}

async function incrementBlinkShareCount(blinkId) {
  const sql = `
    UPDATE ${TABLES.BLINKS}
    SET metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{shareCount}',
      to_jsonb(COALESCE((metadata->>'shareCount')::int, 0) + 1)
    ),
    updated_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;
  const result = await query(sql, [blinkId]);
  return result.rows[0] || null;
}

async function incrementBlinkClickCount(blinkId) {
  const sql = `
    UPDATE ${TABLES.BLINKS}
    SET metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{clickCount}',
      to_jsonb(COALESCE((metadata->>'clickCount')::int, 0) + 1)
    ),
    updated_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;
  const result = await query(sql, [blinkId]);
  return result.rows[0] || null;
}

async function listSharesByBlink({ blinkId, page = 1, pageSize = 20 }) {
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM ${TABLES.BLINK_SHARES}
    WHERE blink_id = $1;
  `;
  const countResult = await query(countSql, [blinkId]);
  const total = countResult.rows[0]?.total || 0;

  const listSql = `
    SELECT * FROM ${TABLES.BLINK_SHARES}
    WHERE blink_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const listResult = await query(listSql, [blinkId, limit, offset]);

  return {
    items: listResult.rows,
    total,
    page,
    pageSize,
  };
}

async function listClicksByBlink({ blinkId, page = 1, pageSize = 20 }) {
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM ${TABLES.BLINK_CLICKS}
    WHERE blink_id = $1;
  `;
  const countResult = await query(countSql, [blinkId]);
  const total = countResult.rows[0]?.total || 0;

  const listSql = `
    SELECT * FROM ${TABLES.BLINK_CLICKS}
    WHERE blink_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const listResult = await query(listSql, [blinkId, limit, offset]);

  return {
    items: listResult.rows,
    total,
    page,
    pageSize,
  };
}

async function aggregateConversionsByBlink(blinkId) {
  const sql = `
    SELECT
      COUNT(*)::int AS total_conversions,
      SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END)::int AS confirmed_conversions,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)::int AS pending_conversions,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)::int AS failed_conversions,
      SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END)::int AS expired_conversions,
      COALESCE(SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END), 0) AS confirmed_amount,
      MIN(created_at) AS first_conversion_at,
      MAX(created_at) AS last_conversion_at
    FROM ${TABLES.BLINK_CONVERSIONS}
    WHERE blink_id = $1;
  `;

  const result = await query(sql, [blinkId]);
  return result.rows[0] || null;
}

async function aggregateConversionsByChannel(blinkId) {
  const sql = `
    SELECT
      COALESCE(sh.channel, 'direct') AS channel,
      COUNT(DISTINCT sh.id)::int AS share_count,
      COUNT(DISTINCT c.id)::int AS click_count,
      COUNT(DISTINCT cv.id)::int AS conversion_count,
      COALESCE(SUM(CASE WHEN cv.status = 'confirmed' THEN cv.amount ELSE 0 END), 0) AS confirmed_amount
    FROM ${TABLES.BLINKS} b
    LEFT JOIN ${TABLES.BLINK_SHARES} sh ON sh.blink_id = b.id
    LEFT JOIN ${TABLES.BLINK_CLICKS} c ON c.blink_id = b.id
    LEFT JOIN ${TABLES.BLINK_CONVERSIONS} cv ON cv.blink_id = b.id
    WHERE b.id = $1
    GROUP BY COALESCE(sh.channel, 'direct');
  `;

  const result = await query(sql, [blinkId]);
  return result.rows;
}

async function aggregateConversionsByToken(blinkId) {
  const sql = `
    SELECT
      token_symbol,
      COUNT(*)::int AS total,
      SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END)::int AS confirmed,
      COALESCE(SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END), 0) AS confirmed_amount
    FROM ${TABLES.BLINK_CONVERSIONS}
    WHERE blink_id = $1
    GROUP BY token_symbol;
  `;

  const result = await query(sql, [blinkId]);
  return result.rows;
}

async function aggregateConversionsByDay({ blinkId, from, to }) {
  const sql = `
    SELECT
      DATE_TRUNC('day', created_at) AS period,
      COUNT(*)::int AS total,
      SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END)::int AS confirmed,
      COALESCE(SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END), 0) AS confirmed_amount
    FROM ${TABLES.BLINK_CONVERSIONS}
    WHERE blink_id = $1
      AND created_at >= $2
      AND created_at <= $3
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY period ASC;
  `;

  const result = await query(sql, [blinkId, from, to]);
  return result.rows;
}

async function aggregateConversionsByWeek({ blinkId, from, to }) {
  const sql = `
    SELECT
      DATE_TRUNC('week', created_at) AS period,
      COUNT(*)::int AS total,
      SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END)::int AS confirmed,
      COALESCE(SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END), 0) AS confirmed_amount
    FROM ${TABLES.BLINK_CONVERSIONS}
    WHERE blink_id = $1
      AND created_at >= $2
      AND created_at <= $3
    GROUP BY DATE_TRUNC('week', created_at)
    ORDER BY period ASC;
  `;

  const result = await query(sql, [blinkId, from, to]);
  return result.rows;
}

async function aggregateConversionsByMonth({ blinkId, from, to }) {
  const sql = `
    SELECT
      DATE_TRUNC('month', created_at) AS period,
      COUNT(*)::int AS total,
      SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END)::int AS confirmed,
      COALESCE(SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END), 0) AS confirmed_amount
    FROM ${TABLES.BLINK_CONVERSIONS}
    WHERE blink_id = $1
      AND created_at >= $2
      AND created_at <= $3
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY period ASC;
  `;

  const result = await query(sql, [blinkId, from, to]);
  return result.rows;
}

async function sumOwnerRevenue({ ownerUserId, from, to }) {
  const sql = `
    SELECT
      COALESCE(SUM(cv.amount), 0) AS total_amount,
      COUNT(*)::int AS conversions
    FROM ${TABLES.BLINKS} b
    JOIN ${TABLES.BLINK_CONVERSIONS} cv ON cv.blink_id = b.id
    WHERE b.owner_user_id = $1
      AND cv.status = 'confirmed'
      AND cv.created_at >= $2
      AND cv.created_at <= $3;
  `;

  const result = await query(sql, [ownerUserId, from, to]);
  return result.rows[0] || { total_amount: 0, conversions: 0 };
}

async function findRecentConversions(blinkId, limit = 10) {
  const sql = `
    SELECT * FROM ${TABLES.BLINK_CONVERSIONS}
    WHERE blink_id = $1
    ORDER BY created_at DESC
    LIMIT $2;
  `;
  const result = await query(sql, [blinkId, limit]);
  return result.rows;
}

async function findRecentShares(blinkId, limit = 10) {
  const sql = `
    SELECT * FROM ${TABLES.BLINK_SHARES}
    WHERE blink_id = $1
    ORDER BY created_at DESC
    LIMIT $2;
  `;
  const result = await query(sql, [blinkId, limit]);
  return result.rows;
}

async function findRecentClicks(blinkId, limit = 10) {
  const sql = `
    SELECT * FROM ${TABLES.BLINK_CLICKS}
    WHERE blink_id = $1
    ORDER BY created_at DESC
    LIMIT $2;
  `;
  const result = await query(sql, [blinkId, limit]);
  return result.rows;
}

async function withTransaction(handler) {
  return transaction(async (client) => handler(client));
}

module.exports = {
  TABLES,
  insertBlinkTemplate,
  findTemplateById,
  listTemplates,
  updateTemplate,
  deleteTemplate,
  incrementBlinkShareCount,
  incrementBlinkClickCount,
  listSharesByBlink,
  listClicksByBlink,
  aggregateConversionsByBlink,
  aggregateConversionsByChannel,
  aggregateConversionsByToken,
  aggregateConversionsByDay,
  aggregateConversionsByWeek,
  aggregateConversionsByMonth,
  sumOwnerRevenue,
  findRecentConversions,
  findRecentShares,
  findRecentClicks,
  withTransaction,
};