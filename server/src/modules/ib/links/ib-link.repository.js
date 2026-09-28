/**
 * IB Link Repository
 *
 * Persistence layer for IB links. Encapsulates all SQL access so
 * higher-level services remain storage-agnostic.
 *
 * @module server/modules/ib/links/ib-link.repository
 */
const { db } = require('../../../database');
const { nowIso } = require('@signalforge/shared/utils/date.util');
async function insertLink({ userId, brokerId, code, label, destination }) {
  const { rows } = await db.query(
    `INSERT INTO ib_links
       (user_id, broker_id, code, label, destination, active, clicks, conversions, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, TRUE, 0, 0, $6, $6)
     RETURNING *`,
    [userId, brokerId || null, code, label || null, destination || null, nowIso()],
  );
  return rows[0];
}
async function findById({ linkId }) {
  const { rows } = await db.query(
    `SELECT * FROM ib_links WHERE id = $1 LIMIT 1`,
    [linkId],
  );
  return rows[0] || null;
}
async function findByCode({ code }) {
  const { rows } = await db.query(
    `SELECT * FROM ib_links WHERE code = $1 LIMIT 1`,
    [code],
  );
  return rows[0] || null;
}
async function listByUser({ userId }) {
  const { rows } = await db.query(
    `SELECT * FROM ib_links
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [userId],
  );
  return rows;
}
async function listActiveByUser({ userId }) {
  const { rows } = await db.query(
    `SELECT * FROM ib_links
      WHERE user_id = $1 AND active = TRUE
      ORDER BY created_at DESC`,
    [userId],
  );
  return rows;
}
async function deactivateLink({ linkId, userId }) {
  const { rowCount } = await db.query(
    `UPDATE ib_links
        SET active = FALSE, updated_at = $1
      WHERE id = $2 AND user_id = $3`,
    [nowIso(), linkId, userId],
  );
  return rowCount > 0;
}
async function incrementClicks({ linkId }) {
  await db.query(
    `UPDATE ib_links
        SET clicks = clicks + 1, updated_at = $1
      WHERE id = $2`,
    [nowIso(), linkId],
  );
}
async function incrementConversions({ linkId }) {
  await db.query(
    `UPDATE ib_links
        SET conversions = conversions + 1, updated_at = $1
      WHERE id = $2`,
    [nowIso(), linkId],
  );
}
async function countByUser({ userId }) {
  const { rows } = await db.query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE active = TRUE)::int AS active
       FROM ib_links
      WHERE user_id = $1`,
    [userId],
  );
  return rows[0] || { total: 0, active: 0 };
}
const ibLinkRepository = {
  insertLink,
  findById,
  findByCode,
  listByUser,
  listActiveByUser,
  deactivateLink,
  incrementClicks,
  incrementConversions,
  countByUser,
};
module.exports.ibLinkRepository = ibLinkRepository;

module.exports.insertLink = insertLink;

module.exports.findById = findById;

module.exports.findByCode = findByCode;

module.exports.listByUser = listByUser;

module.exports.listActiveByUser = listActiveByUser;

module.exports.deactivateLink = deactivateLink;

module.exports.incrementClicks = incrementClicks;

module.exports.incrementConversions = incrementConversions;

module.exports.countByUser = countByUser;
