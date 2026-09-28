/**
 * Withdrawal Repository
 *
 * @module signalforge/server/modules/withdrawals/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class WithdrawalRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createAccount(data) {
    const result = await this.db.query(
      `INSERT INTO withdrawal_accounts (
         user_id, method_type, label, details, status, verified_at,
         is_default, metadata, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING id, user_id, method_type, label, status, is_default, created_at`,
      [
        data.userId,
        data.methodType,
        data.label || null,
        data.details ? JSON.stringify(data.details) : null,
        data.status || 'PENDING',
        data.verifiedAt || null,
        data.isDefault === true,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findAccountById(accountId) {
    const result = await this.db.query(
      `SELECT id, user_id, method_type, label, details, status, verified_at,
              is_default, metadata, created_at, updated_at
         FROM withdrawal_accounts
        WHERE id = $1
        LIMIT 1`,
      [accountId],
    );
    return result.rows[0] || null;
  }

  async findAccountByIdForUser(accountId, userId) {
    const result = await this.db.query(
      `SELECT id, user_id, method_type, label, details, status, verified_at,
              is_default, metadata, created_at, updated_at
         FROM withdrawal_accounts
        WHERE id = $1 AND user_id = $2
        LIMIT 1`,
      [accountId, userId],
    );
    return result.rows[0] || null;
  }

  async listAccounts(userId, filters = {}) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.methodType) {
      conditions.push(`method_type = $${index++}`);
      values.push(filters.methodType);
    }

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT id, user_id, method_type, label, details, status, verified_at,
              is_default, created_at, updated_at
         FROM withdrawal_accounts
         ${where}
        ORDER BY is_default DESC, created_at DESC`,
      values,
    );
    return result.rows;
  }

  async updateAccount(accountId, data) {
    const fields = [];
    const values = [accountId];
    let index = 2;

    const mapping = {
      label: 'label',
      status: 'status',
      verifiedAt: 'verified_at',
      isDefault: 'is_default',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.details !== undefined) {
      fields.push(`details = $${index++}`);
      values.push(data.details ? JSON.stringify(data.details) : null);
    }
    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return this.findAccountById(accountId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE withdrawal_accounts SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findAccountById(accountId);
  }

  async deleteAccount(accountId) {
    await this.db.query('DELETE FROM withdrawal_accounts WHERE id = $1', [accountId]);
  }

  async createRequest(data) {
    const result = await this.db.query(
      `INSERT INTO withdrawal_requests (
         user_id, account_id, purpose, method_type, amount, currency, amount_usd,
         fee_amount, net_amount, status, requires_review, reviewed_by, reviewed_at,
         reviewed_reason, processed_by, processed_at, external_reference,
         external_transaction_id, source_wallet_id, source_wallet_ledger_entry_id,
         failure_reason, metadata, requested_at, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
         $16, $17, $18, $19, $20, $21, $22, $23, NOW(), NOW()
       )
       RETURNING id, user_id, account_id, amount, currency, amount_usd, net_amount,
                 status, requires_review, requested_at, created_at`,
      [
        data.userId,
        data.accountId,
        data.purpose,
        data.methodType,
        data.amount,
        data.currency || 'USD',
        data.amountUsd ?? null,
        data.feeAmount ?? 0,
        data.netAmount ?? data.amount,
        data.status || 'PENDING',
        data.requiresReview === true,
        data.reviewedBy || null,
        data.reviewedAt || null,
        data.reviewedReason || null,
        data.processedBy || null,
        data.processedAt || null,
        data.externalReference || null,
        data.externalTransactionId || null,
        data.sourceWalletId || null,
        data.sourceWalletLedgerEntryId || null,
        data.failureReason || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
        data.requestedAt || new Date(),
      ],
    );
    return result.rows[0];
  }

  async findRequestById(requestId) {
    const result = await this.db.query(
      `SELECT id, user_id, account_id, purpose, method_type, amount, currency,
              amount_usd, fee_amount, net_amount, status, requires_review,
              reviewed_by, reviewed_at, reviewed_reason, processed_by,
              processed_at, external_reference, external_transaction_id,
              source_wallet_id, source_wallet_ledger_entry_id, failure_reason,
              metadata, requested_at, created_at, updated_at
         FROM withdrawal_requests
        WHERE id = $1
        LIMIT 1`,
      [requestId],
    );
    return result.rows[0] || null;
  }

  async findRequestByIdForUser(requestId, userId) {
    const result = await this.db.query(
      `SELECT id, user_id, account_id, purpose, method_type, amount, currency,
              amount_usd, fee_amount, net_amount, status, requires_review,
              reviewed_by, reviewed_at, reviewed_reason, processed_by,
              processed_at, external_reference, external_transaction_id,
              failure_reason, metadata, requested_at, created_at, updated_at
         FROM withdrawal_requests
        WHERE id = $1 AND user_id = $2
        LIMIT 1`,
      [requestId, userId],
    );
    return result.rows[0] || null;
  }

  async listRequests(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${index++}`);
      values.push(filters.userId);
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        conditions.push(`status = ANY($${index++}::text[])`);
        values.push(filters.status);
      } else {
        conditions.push(`status = $${index++}`);
        values.push(filters.status);
      }
    }

    if (filters.purpose) {
      conditions.push(`purpose = $${index++}`);
      values.push(filters.purpose);
    }

    if (filters.methodType) {
      conditions.push(`method_type = $${index++}`);
      values.push(filters.methodType);
    }

    if (filters.requiresReview !== undefined) {
      conditions.push(`requires_review = $${index++}`);
      values.push(filters.requiresReview);
    }

    if (filters.since) {
      conditions.push(`requested_at >= $${index++}`);
      values.push(filters.since);
    }

    if (filters.until) {
      conditions.push(`requested_at <= $${index++}`);
      values.push(filters.until);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM withdrawal_requests ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, user_id, account_id, purpose, method_type, amount, currency,
              amount_usd, fee_amount, net_amount, status, requires_review,
              reviewed_at, processed_at, failure_reason, requested_at, created_at
         FROM withdrawal_requests
         ${where}
        ORDER BY requested_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { requests: result.rows, total, limit, offset };
  }

  async updateRequest(requestId, data) {
    const fields = [];
    const values = [requestId];
    let index = 2;

    const mapping = {
      status: 'status',
      requiresReview: 'requires_review',
      reviewedBy: 'reviewed_by',
      reviewedAt: 'reviewed_at',
      reviewedReason: 'reviewed_reason',
      processedBy: 'processed_by',
      processedAt: 'processed_at',
      externalReference: 'external_reference',
      externalTransactionId: 'external_transaction_id',
      sourceWalletId: 'source_wallet_id',
      sourceWalletLedgerEntryId: 'source_wallet_ledger_entry_id',
      failureReason: 'failure_reason',
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
      return this.findRequestById(requestId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE withdrawal_requests SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findRequestById(requestId);
  }

  async countActiveRequestsForUser(userId) {
    const result = await this.db.query(
      `SELECT COUNT(*)::int AS count
         FROM withdrawal_requests
        WHERE user_id = $1
          AND status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING')`,
      [userId],
    );
    return result.rows[0]?.count || 0;
  }

  async sumWithdrawalsForPeriod(userId, since, until = null) {
    const values = [userId, since];
    let query = `
      SELECT COALESCE(SUM(amount_usd), 0)::numeric AS total,
             COUNT(*)::int AS count
        FROM withdrawal_requests
       WHERE user_id = $1
         AND status IN ('APPROVED', 'PROCESSING', 'COMPLETED')
         AND requested_at >= $2
    `;
    if (until) {
      query += ` AND requested_at <= $3`;
      values.push(until);
    }
    const result = await this.db.query(query, values);
    const row = result.rows[0] || {};
    return {
      total: Number(row.total || 0),
      count: row.count || 0,
    };
  }

  async countByStatus(filters = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${index++}`);
      values.push(filters.userId);
    }

    if (filters.since) {
      conditions.push(`requested_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT status, COUNT(*)::int AS count
         FROM withdrawal_requests
         ${where}
        GROUP BY status`,
      values,
    );
    return result.rows;
  }

  async sumByMethodType(filters = {}) {
    const conditions = ["status IN ('APPROVED', 'PROCESSING', 'COMPLETED')"];
    const values = [];
    let index = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${index++}`);
      values.push(filters.userId);
    }

    if (filters.since) {
      conditions.push(`requested_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT method_type,
              COALESCE(SUM(amount_usd), 0)::numeric AS total,
              COUNT(*)::int AS count
         FROM withdrawal_requests
         ${where}
        GROUP BY method_type`,
      values,
    );
    return result.rows;
  }
}

export default WithdrawalRepository;