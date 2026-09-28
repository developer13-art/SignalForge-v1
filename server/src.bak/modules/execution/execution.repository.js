/**
 * Execution Repository
 *
 * @module signalforge/server/modules/execution/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class ExecutionRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createRequest(data) {
    const result = await this.db.query(
      `INSERT INTO execution_requests (
         trade_id, signal_id, user_id, broker_account_id, metaapi_account_id,
         platform, symbol, direction, entry_type, volume, price, stop_loss,
         take_profit, comment, magic_number, slippage, status, attempt,
         max_attempts, requested_at, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
         $17, $18, $19, $20, NOW(), NOW()
       )
       RETURNING id, trade_id, signal_id, user_id, broker_account_id, status,
                 attempt, max_attempts, requested_at, created_at`,
      [
        data.tradeId,
        data.signalId || null,
        data.userId,
        data.brokerAccountId,
        data.metaApiAccountId || null,
        data.platform || null,
        data.symbol,
        data.direction,
        data.entryType,
        data.volume,
        data.price ?? null,
        data.stopLoss ?? null,
        data.takeProfit ?? null,
        data.comment || null,
        data.magicNumber ?? null,
        data.slippage ?? null,
        data.status || 'PENDING',
        data.attempt || 1,
        data.maxAttempts || 3,
        data.requestedAt || new Date(),
      ],
    );
    return result.rows[0];
  }

  async findRequestById(requestId) {
    const result = await this.db.query(
      `SELECT id, trade_id, signal_id, user_id, broker_account_id, metaapi_account_id,
              platform, symbol, direction, entry_type, volume, price, stop_loss,
              take_profit, comment, magic_number, slippage, status, attempt,
              max_attempts, requested_at, submitted_at, completed_at, failed_at,
              broker_order_id, broker_position_id, broker_ticket, executed_price,
              executed_volume, rejection_reason, broker_response, error, metadata,
              duration_ms, created_at, updated_at
         FROM execution_requests
        WHERE id = $1
        LIMIT 1`,
      [requestId],
    );
    return result.rows[0] || null;
  }

  async findRequestsByTrade(tradeId) {
    const result = await this.db.query(
      `SELECT id, trade_id, signal_id, user_id, broker_account_id, status, attempt,
              broker_order_id, broker_position_id, executed_price, duration_ms,
              created_at, completed_at
         FROM execution_requests
        WHERE trade_id = $1
        ORDER BY created_at DESC`,
      [tradeId],
    );
    return result.rows;
  }

  async findPendingRetries() {
    const result = await this.db.query(
      `SELECT id, trade_id, user_id, broker_account_id, symbol, direction,
              entry_type, volume, price, stop_loss, take_profit, status, attempt,
              max_attempts, created_at
         FROM execution_requests
        WHERE status IN ('PENDING', 'RETRYING')
        ORDER BY created_at ASC
        LIMIT 100`,
    );
    return result.rows;
  }

  async updateRequest(requestId, data) {
    const fields = [];
    const values = [requestId];
    let index = 2;

    const mapping = {
      status: 'status',
      attempt: 'attempt',
      submittedAt: 'submitted_at',
      completedAt: 'completed_at',
      failedAt: 'failed_at',
      brokerOrderId: 'broker_order_id',
      brokerPositionId: 'broker_position_id',
      brokerTicket: 'broker_ticket',
      executedPrice: 'executed_price',
      executedVolume: 'executed_volume',
      rejectionReason: 'rejection_reason',
      error: 'error',
      durationMs: 'duration_ms',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.brokerResponse !== undefined) {
      fields.push(`broker_response = $${index++}`);
      values.push(data.brokerResponse ? JSON.stringify(data.brokerResponse) : null);
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
      `UPDATE execution_requests SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );

    return this.findRequestById(requestId);
  }

  async incrementAttempt(requestId) {
    await this.db.query(
      `UPDATE execution_requests
          SET attempt = attempt + 1,
              status = 'RETRYING',
              updated_at = NOW()
        WHERE id = $1`,
      [requestId],
    );
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
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    if (filters.brokerAccountId) {
      conditions.push(`broker_account_id = $${index++}`);
      values.push(filters.brokerAccountId);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM execution_requests ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, trade_id, signal_id, user_id, broker_account_id, symbol, direction,
              entry_type, volume, price, status, attempt, broker_order_id,
              executed_price, duration_ms, created_at, completed_at
         FROM execution_requests
         ${where}
         ORDER BY created_at DESC
         LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { requests: result.rows, total, limit, offset };
  }

  async createLog(data) {
    const result = await this.db.query(
      `INSERT INTO execution_logs (
         execution_request_id, trade_id, user_id, broker_account_id, operation,
         status, request_payload, response_payload, error, duration_ms, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING id, operation, status, duration_ms, created_at`,
      [
        data.executionRequestId || null,
        data.tradeId || null,
        data.userId || null,
        data.brokerAccountId || null,
        data.operation,
        data.status,
        data.requestPayload ? JSON.stringify(data.requestPayload) : null,
        data.responsePayload ? JSON.stringify(data.responsePayload) : null,
        data.error || null,
        data.durationMs ?? null,
      ],
    );
    return result.rows[0];
  }

  async listLogs(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.tradeId) {
      conditions.push(`trade_id = $${index++}`);
      values.push(filters.tradeId);
    }

    if (filters.executionRequestId) {
      conditions.push(`execution_request_id = $${index++}`);
      values.push(filters.executionRequestId);
    }

    if (filters.operation) {
      conditions.push(`operation = $${index++}`);
      values.push(filters.operation);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const result = await this.db.query(
      `SELECT id, execution_request_id, trade_id, user_id, broker_account_id,
              operation, status, error, duration_ms, created_at
         FROM execution_logs
         ${where}
         ORDER BY created_at DESC
         LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { logs: result.rows, limit, offset };
  }

  async countByStatus(filters = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT status, COUNT(*)::int AS count
         FROM execution_requests
         ${where}
        GROUP BY status`,
      values,
    );
    return result.rows;
  }

  async averageLatency(filters = {}) {
    const conditions = ["status = 'COMPLETED'", 'duration_ms IS NOT NULL'];
    const values = [];
    let index = 1;

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT AVG(duration_ms)::numeric AS average, COUNT(*)::int AS count
         FROM execution_requests
         ${where}`,
      values,
    );
    const row = result.rows[0];
    return {
      averageMs: row?.average !== null ? Number(row.average) : null,
      count: row?.count || 0,
    };
  }

  async countBySymbol(filters = {}, limit = 20) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT symbol, COUNT(*)::int AS count,
              AVG(duration_ms)::numeric AS average_latency
         FROM execution_requests
         ${where}
        GROUP BY symbol
        ORDER BY count DESC
        LIMIT $${index}`,
      [...values, limit],
    );
    return result.rows;
  }
}

export default ExecutionRepository;