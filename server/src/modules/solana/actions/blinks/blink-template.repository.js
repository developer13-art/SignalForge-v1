'use strict';

const { query } = require('../../../../database/connection');
const { buildPagination } = require('../../../../database/helpers/pagination.helper');

/**
 * SignalForge - Blink Template Repository
 *
 * Dedicated persistence for Blink templates. A template is a reusable
 * configuration that a provider or owner can instantiate into a real
 * Blink without re-entering details every time.
 */

const TABLE = 'solana_blink_templates';

async function createTemplate(client, payload) {
  const sql = `
    INSERT INTO ${TABLE} (
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
    payload.amountDecimals || null,
    payload.metadata ? JSON.stringify(payload.metadata) : JSON.stringify({}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findById(id) {
  const sql = `SELECT * FROM ${TABLE} WHERE id = $1 LIMIT 1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

async function findByName({ ownerUserId, providerId, name }) {
  const conditions = ['name = $1'];
  const params = [name];

  if (ownerUserId) {
    params.push(ownerUserId);
    conditions.push(`owner_user_id = $${params.length}`);
  }

  if (providerId) {
    params.push(providerId);
    conditions.push(`provider_id = $${params.length}`);
  }

  const sql = `
    SELECT * FROM ${TABLE}
    WHERE ${conditions.join(' AND ')}
    ORDER BY updated_at DESC
    LIMIT 1;
  `;

  const result = await query(sql, params);
  return result.rows[0] || null;
}

async function list({ ownerUserId, providerId, templateType, page = 1, pageSize = 20 }) {
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

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLE} ${whereClause};`;
  const countResult = await query(countSql, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(limit);
  params.push(offset);

  const listSql = `
    SELECT * FROM ${TABLE}
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

async function update(id, updates) {
  const columnMap = {
    name: 'name',
    title: 'title',
    description: 'description',
    label: 'label',
    message: 'message',
    iconUrl: 'icon_url',
    website: 'website',
    planId: 'plan_id',
    referralCode: 'referral_code',
    tokenSymbol: 'token_symbol',
    tokenMint: 'token_mint',
    amount: 'amount',
    amountDecimals: 'amount_decimals',
    metadata: 'metadata',
  };

  const setClauses = [];
  const params = [id];

  for (const [key, value] of Object.entries(updates || {})) {
    const column = columnMap[key];
    if (column && value !== undefined) {
      params.push(key === 'metadata' ? JSON.stringify(value) : value);
      setClauses.push(`${column} = $${params.length}`);
    }
  }

  if (setClauses.length === 0) {
    return findById(id);
  }

  setClauses.push('updated_at = NOW()');

  const sql = `
    UPDATE ${TABLE}
    SET ${setClauses.join(', ')}
    WHERE id = $1
    RETURNING *;
  `;

  const result = await query(sql, params);
  return result.rows[0] || null;
}

async function remove(id) {
  const sql = `DELETE FROM ${TABLE} WHERE id = $1 RETURNING id;`;
  const result = await query(sql, [id]);
  return Boolean(result.rows[0]);
}

async function countByOwner(ownerUserId) {
  const sql = `SELECT COUNT(*)::int AS total FROM ${TABLE} WHERE owner_user_id = $1;`;
  const result = await query(sql, [ownerUserId]);
  return result.rows[0]?.total || 0;
}

module.exports = {
  TABLE,
  createTemplate,
  findById,
  findByName,
  list,
  update,
  remove,
  countByOwner,
};