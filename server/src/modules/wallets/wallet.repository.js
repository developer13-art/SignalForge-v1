/**
 * Wallet Repository
 *
 * @module signalforge/server/modules/wallets/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class WalletRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async create(data) {
    const result = await this.db.query(
      `INSERT INTO wallets (
         user_id, provider_id, wallet_type, currency, status,
         available_balance, pending_balance, reserved_balance, total_balance,
         lifetime_credited, lifetime_debited, frozen_reason, metadata,
         created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
       )
       ON CONFLICT (user_id, wallet_type, currency) DO NOTHING
       RETURNING id, user_id, provider_id, wallet_type, currency, status,
                 available_balance, pending_balance, reserved_balance,
                 total_balance, created_at`,
      [
        data.userId,
        data.providerId || null,
        data.walletType || 'USER',
        data.currency || 'USD',
        data.status || 'ACTIVE',
        data.availableBalance ?? 0,
        data.pendingBalance ?? 0,
        data.reservedBalance ?? 0,
        data.totalBalance ?? 0,
        data.lifetimeCredited ?? 0,
        data.lifetimeDebited ?? 0,
        data.frozenReason || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0] || null;
  }

  async findById(walletId) {
    const result = await this.db.query(
      `SELECT id, user_id, provider_id, wallet_type, currency, status,
              available_balance, pending_balance, reserved_balance, total_balance,
              lifetime_credited, lifetime_debited, frozen_reason, metadata,
              created_at, updated_at
         FROM wallets
        WHERE id = $1
        LIMIT 1`,
      [walletId],
    );
    return result.rows[0] || null;
  }

  async findByIdForUser(walletId, userId) {
    const result = await this.db.query(
      `SELECT id, user_id, provider_id, wallet_type, currency, status,
              available_balance, pending_balance, reserved_balance, total_balance,
              lifetime_credited, lifetime_debited, frozen_reason, metadata,
              created_at, updated_at
         FROM wallets
        WHERE id = $1 AND user_id = $2
        LIMIT 1`,
      [walletId, userId],
    );
    return result.rows[0] || null;
  }

  async findByUserAndType(userId, walletType = 'USER', currency = 'USD') {
    const result = await this.db.query(
      `SELECT id, user_id, provider_id, wallet_type, currency, status,
              available_balance, pending_balance, reserved_balance, total_balance,
              lifetime_credited, lifetime_debited, frozen_reason, metadata,
              created_at, updated_at
         FROM wallets
        WHERE user_id = $1
          AND wallet_type = $2
          AND currency = $3
        LIMIT 1`,
      [userId, walletType, currency],
    );
    return result.rows[0] || null;
  }

  async listForUser(userId, filters = {}) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.walletType) {
      conditions.push(`wallet_type = $${index++}`);
      values.push(filters.walletType);
    }

    if (filters.currency) {
      conditions.push(`currency = $${index++}`);
      values.push(filters.currency);
    }

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT id, user_id, provider_id, wallet_type, currency, status,
              available_balance, pending_balance, reserved_balance, total_balance,
              lifetime_credited, lifetime_debited, created_at, updated_at
         FROM wallets
         ${where}
        ORDER BY wallet_type ASC, currency ASC`,
      values,
    );
    return result.rows;
  }

  async update(walletId, data) {
    const fields = [];
    const values = [walletId];
    let index = 2;

    const mapping = {
      status: 'status',
      availableBalance: 'available_balance',
      pendingBalance: 'pending_balance',
      reservedBalance: 'reserved_balance',
      totalBalance: 'total_balance',
      lifetimeCredited: 'lifetime_credited',
      lifetimeDebited: 'lifetime_debited',
      frozenReason: 'frozen_reason',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return this.findById(walletId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE wallets SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );

    return this.findById(walletId);
  }

  async delete(walletId) {
    await this.db.query('DELETE FROM wallets WHERE id = $1', [walletId]);
  }

  async createLedgerEntry(data) {
    const result = await this.db.query(
      `INSERT INTO wallet_ledger (
         wallet_id, user_id, entry_type, direction, amount, currency,
         balance_before, balance_after, reference_type, reference_id,
         description, related_entry_id, is_reversal, reversal_of_entry_id,
         actor_id, actor_type, status, metadata, recorded_at, created_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
         $15, $16, $17, $18, NOW(), NOW()
       )
       RETURNING id, wallet_id, entry_type, direction, amount, currency,
                 balance_after, status, recorded_at`,
      [
        data.walletId,
        data.userId,
        data.entryType,
        data.direction,
        data.amount,
        data.currency || 'USD',
        data.balanceBefore ?? null,
        data.balanceAfter ?? null,
        data.referenceType || null,
        data.referenceId || null,
        data.description || null,
        data.relatedEntryId || null,
        data.isReversal === true,
        data.reversalOfEntryId || null,
        data.actorId || null,
        data.actorType || null,
        data.status || 'POSTED',
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findLedgerEntryById(entryId) {
    const result = await this.db.query(
      `SELECT id, wallet_id, user_id, entry_type, direction, amount, currency,
              balance_before, balance_after, reference_type, reference_id,
              description, related_entry_id, is_reversal, reversal_of_entry_id,
              actor_id, actor_type, status, metadata, recorded_at, created_at
         FROM wallet_ledger
        WHERE id = $1
        LIMIT 1`,
      [entryId],
    );
    return result.rows[0] || null;
  }

  async findLedgerEntryByReference(referenceType, referenceId) {
    const result = await this.db.query(
      `SELECT id, wallet_id, user_id, entry_type, direction, amount, currency,
              balance_before, balance_after, status, recorded_at
         FROM wallet_ledger
        WHERE reference_type = $1
          AND reference_id = $2
          AND status = 'POSTED'
        LIMIT 1`,
      [referenceType, referenceId],
    );
    return result.rows[0] || null;
  }

  async listLedgerEntries(walletId, filters = {}, pagination = {}) {
    const conditions = ['wallet_id = $1'];
    const values = [walletId];
    let index = 2;

    if (filters.entryType) {
      conditions.push(`entry_type = $${index++}`);
      values.push(filters.entryType);
    }

    if (filters.direction) {
      conditions.push(`direction = $${index++}`);
      values.push(filters.direction);
    }

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    if (filters.since) {
      conditions.push(`recorded_at >= $${index++}`);
      values.push(filters.since);
    }

    if (filters.until) {
      conditions.push(`recorded_at <= $${index++}`);
      values.push(filters.until);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 50, 1), 500);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM wallet_ledger ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, wallet_id, user_id, entry_type, direction, amount, currency,
              balance_before, balance_after, reference_type, reference_id,
              description, is_reversal, reversal_of_entry_id, actor_id,
              actor_type, status, recorded_at
         FROM wallet_ledger
         ${where}
        ORDER BY recorded_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { entries: result.rows, total, limit, offset };
  }

  async listLedgerEntriesForUser(userId, filters = {}, pagination = {}) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.entryType) {
      conditions.push(`entry_type = $${index++}`);
      values.push(filters.entryType);
    }

    if (filters.direction) {
      conditions.push(`direction = $${index++}`);
      values.push(filters.direction);
    }

    if (filters.since) {
      conditions.push(`recorded_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 50, 1), 500);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM wallet_ledger ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, wallet_id, user_id, entry_type, direction, amount, currency,
              balance_before, balance_after, reference_type, reference_id,
              description, status, recorded_at
         FROM wallet_ledger
         ${where}
        ORDER BY recorded_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { entries: result.rows, total, limit, offset };
  }

  async computeBalanceFromLedger(walletId) {
    const result = await this.db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN direction = 'CREDIT' AND status = 'POSTED' THEN amount ELSE 0 END), 0)::numeric AS total_credits,
         COALESCE(SUM(CASE WHEN direction = 'DEBIT' AND status = 'POSTED' THEN amount ELSE 0 END), 0)::numeric AS total_debits,
         COALESCE(SUM(CASE WHEN direction = 'CREDIT' AND status = 'POSTED' THEN amount ELSE -amount END), 0)::numeric AS net_balance,
         COUNT(*)::int AS entry_count
         FROM wallet_ledger
        WHERE wallet_id = $1`,
      [walletId],
    );
    const row = result.rows[0] || {};
    return {
      totalCredits: Number(row.total_credits || 0),
      totalDebits: Number(row.total_debits || 0),
      netBalance: Number(row.net_balance || 0),
      entryCount: row.entry_count || 0,
    };
  }

  async listWalletsWithDrift(tolerance = 0.01) {
    const result = await this.db.query(
      `SELECT w.id, w.user_id, w.wallet_type, w.currency, w.total_balance,
              COALESCE(SUM(CASE WHEN l.direction = 'CREDIT' AND l.status = 'POSTED' THEN l.amount ELSE -l.amount END), 0)::numeric AS ledger_balance
         FROM wallets w
         LEFT JOIN wallet_ledger l ON l.wallet_id = w.id
        GROUP BY w.id
       HAVING ABS(w.total_balance - COALESCE(SUM(CASE WHEN l.direction = 'CREDIT' AND l.status = 'POSTED' THEN l.amount ELSE -l.amount END), 0)) > $1`,
      [tolerance],
    );
    return result.rows;
  }

  async sumByWalletType(walletType, currency = null) {
    const values = [walletType];
    let query = `
      SELECT
         COALESCE(SUM(total_balance), 0)::numeric AS total,
         COUNT(*)::int AS wallet_count
        FROM wallets
       WHERE wallet_type = $1
    `;
    if (currency) {
      query += ` AND currency = $2`;
      values.push(currency);
    }
    const result = await this.db.query(query, values);
    const row = result.rows[0] || {};
    return {
      total: Number(row.total || 0),
      walletCount: row.wallet_count || 0,
    };
  }
}

export default WalletRepository;