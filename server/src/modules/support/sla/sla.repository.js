/**
 * SLA Repository
 *
 * Persistence layer for SLA tracking and breach recording.
 *
 * @module server/modules/support/sla/sla.repository
 */
const { db } = require('../../../database');
const { nowIso } = require('@signalforge/shared/utils/date.util');
async function insertBreach({ ticketId, breachType, dueAt, minutesOverdue }) {
  const { rows } = await db.query(
    `INSERT INTO support_sla_breaches
       (ticket_id, breach_type, due_at, minutes_overdue, recorded_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [ticketId, breachType, dueAt, minutesOverdue, nowIso()],
  );
  return rows[0];
}
async function listBreachesForTicket({ ticketId }) {
  const { rows } = await db.query(
    `SELECT * FROM support_sla_breaches
      WHERE ticket_id = $1
      ORDER BY recorded_at ASC`,
    [ticketId],
  );
  return rows;
}
async function findExistingBreach({ ticketId, breachType }) {
  const { rows } = await db.query(
    `SELECT * FROM support_sla_breaches
      WHERE ticket_id = $1 AND breach_type = $2
      ORDER BY recorded_at DESC
      LIMIT 1`,
    [ticketId, breachType],
  );
  return rows[0] || null;
}
async function listRecentBreaches({ limit = 100 }) {
  const { rows } = await db.query(
    `SELECT b.*, t.ticket_number, t.subject, t.priority
       FROM support_sla_breaches b
       JOIN support_tickets t ON t.id = b.ticket_id
      ORDER BY b.recorded_at DESC
      LIMIT $1`,
    [limit],
  );
  return rows;
}
async function aggregateBreachesByType({ since }) {
  const { rows } = await db.query(
    `SELECT breach_type, COUNT(*)::int AS count
       FROM support_sla_breaches
      WHERE recorded_at >= $1
      GROUP BY breach_type`,
    [since],
  );
  return rows;
}
const slaRepository = {
  insertBreach,
  listBreachesForTicket,
  findExistingBreach,
  listRecentBreaches,
  aggregateBreachesByType,
};
module.exports.slaRepository = slaRepository;

module.exports.insertBreach = insertBreach;

module.exports.listBreachesForTicket = listBreachesForTicket;

module.exports.findExistingBreach = findExistingBreach;

module.exports.listRecentBreaches = listRecentBreaches;

module.exports.aggregateBreachesByType = aggregateBreachesByType;
