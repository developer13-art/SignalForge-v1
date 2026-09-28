/**
 * Admin Broker Repository
 *
 * Persistence layer for administrative broker management.
 *
 * @module server/modules/admin/brokers/admin-broker.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function listBrokerAccounts({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.userId) {
    params.push(filters.userId);
    conditions.push(`ba.user_id = $${params.length}`);
  }

  if (filters.platform) {
    params.push(filters.platform);
    conditions.push(`ba.platform = $${params.length}`);
  }

  if (filters.accountType) {
    params.push(filters.accountType);
    conditions.push(`ba.account_type = $${params.length}`);
  }

  if (filters.connectionStatus) {
    params.push(filters.connectionStatus);
    conditions.push(`ba.connection_status = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT ba.id, ba.user_id, ba.account_nickname, ba.platform, ba.account_type,
            ba.connection_status, ba.balance, ba.equity, ba.currency,
            ba.metaapi_account_id, ba.last_synced_at, ba.created_at,
            u.email AS user_email
       FROM broker_accounts ba
       LEFT JOIN users u ON u.id = ba.user_id
       ${where}
       ORDER BY ba.created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM broker_accounts ba ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function findBrokerAccountById({ brokerAccountId }) {
  const { rows } = await db.query(
    `SELECT * FROM broker_accounts WHERE id = $1 LIMIT 1`,
    [brokerAccountId],
  );
  return rows[0] || null;
}

export async function markBrokerDisconnected({ brokerAccountId, adminId, reason }) {
  const { rowCount } = await db.query(
    `UPDATE broker_accounts
        SET connection_status = 'DISCONNECTED',
            disconnected_reason = $1,
            disconnected_by = $2,
            updated_at = $3
      WHERE id = $4`,
    [reason || 'ADMIN_DISCONNECT', adminId, nowIso(), brokerAccountId],
  );
  return rowCount > 0;
}

export async function countByConnectionStatus() {
  const { rows } = await db.query(
    `SELECT connection_status, COUNT(*)::int AS count
       FROM broker_accounts
      GROUP BY connection_status`,
  );
  return rows;
}

export const adminBrokerRepository = {
  listBrokerAccounts,
  findBrokerAccountById,
  markBrokerDisconnected,
  countByConnectionStatus,
};