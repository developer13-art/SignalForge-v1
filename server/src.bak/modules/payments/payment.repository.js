/**
 * Payments Repository
 *
 * @module signalforge/server/modules/payments/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class PaymentRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createIntent(data) {
    const result = await this.db.query(
      `INSERT INTO payment_intents (
         user_id, purpose, provider, amount, currency, amount_usd,
         reference_id, status, metadata, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING id, user_id, purpose, provider, amount, currency, amount_usd,
                 reference_id, status, created_at`,
      [
        data.userId,
        data.purpose,
        data.provider,
        data.amount,
        data.currency || 'USD',
        data.amountUsd ?? null,
        data.referenceId || null,
        data.status || 'PENDING',
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findIntentById(intentId) {
    const result = await this.db.query(
      `SELECT id, user_id, purpose, provider, amount, currency, amount_usd,
              reference_id, status, external_intent_id, client_secret,
              metadata, created_at, updated_at
         FROM payment_intents
        WHERE id = $1
        LIMIT 1`,
      [intentId],
    );
    return result.rows[0] || null;
  }

  async findIntentByExternalId(externalIntentId) {
    const result = await this.db.query(
      `SELECT id, user_id, purpose, provider, amount, currency, amount_usd,
              reference_id, status, external_intent_id, created_at
         FROM payment_intents
        WHERE external_intent_id = $1
        LIMIT 1`,
      [externalIntentId],
    );
    return result.rows[0] || null;
  }

  async updateIntent(intentId, data) {
    const fields = [];
    const values = [intentId];
    let index = 2;

    const mapping = {
      status: 'status',
      externalIntentId: 'external_intent_id',
      clientSecret: 'client_secret',
      amountUsd: 'amount_usd',
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
      return this.findIntentById(intentId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE payment_intents SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findIntentById(intentId);
  }

  async createPayment(data) {
    const result = await this.db.query(
      `INSERT INTO payments (
         user_id, intent_id, provider, amount, currency, amount_usd,
         purpose, reference_id, status, external_payment_id, external_customer_id,
         paid_at, failed_at, failure_reason, refunded_amount, metadata,
         created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
         NOW(), NOW()
       )
       RETURNING id, user_id, intent_id, provider, amount, currency, amount_usd,
                 purpose, reference_id, status, created_at`,
      [
        data.userId,
        data.intentId || null,
        data.provider,
        data.amount,
        data.currency || 'USD',
        data.amountUsd ?? null,
        data.purpose,
        data.referenceId || null,
        data.status || 'PENDING',
        data.externalPaymentId || null,
        data.externalCustomerId || null,
        data.paidAt || null,
        data.failedAt || null,
        data.failureReason || null,
        data.refundedAmount ?? 0,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findPaymentById(paymentId) {
    const result = await this.db.query(
      `SELECT id, user_id, intent_id, provider, amount, currency, amount_usd,
              purpose, reference_id, status, external_payment_id,
              external_customer_id, paid_at, failed_at, failure_reason,
              refunded_amount, metadata, created_at, updated_at
         FROM payments
        WHERE id = $1
        LIMIT 1`,
      [paymentId],
    );
    return result.rows[0] || null;
  }

  async findPaymentByIdForUser(paymentId, userId) {
    const result = await this.db.query(
      `SELECT id, user_id, intent_id, provider, amount, currency, amount_usd,
              purpose, reference_id, status, external_payment_id,
              external_customer_id, paid_at, failed_at, failure_reason,
              refunded_amount, metadata, created_at, updated_at
         FROM payments
        WHERE id = $1 AND user_id = $2
        LIMIT 1`,
      [paymentId, userId],
    );
    return result.rows[0] || null;
  }

  async findPaymentByExternalId(externalPaymentId) {
    const result = await this.db.query(
      `SELECT id, user_id, intent_id, provider, amount, currency, amount_usd,
              purpose, reference_id, status, external_payment_id,
              refunded_amount, created_at, updated_at
         FROM payments
        WHERE external_payment_id = $1
        LIMIT 1`,
      [externalPaymentId],
    );
    return result.rows[0] || null;
  }

  async updatePayment(paymentId, data) {
    const fields = [];
    const values = [paymentId];
    let index = 2;

    const mapping = {
      status: 'status',
      externalPaymentId: 'external_payment_id',
      externalCustomerId: 'external_customer_id',
      paidAt: 'paid_at',
      failedAt: 'failed_at',
      failureReason: 'failure_reason',
      refundedAmount: 'refunded_amount',
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
      return this.findPaymentById(paymentId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE payments SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findPaymentById(paymentId);
  }

  async listPayments(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${index++}`);
      values.push(filters.userId);
    }

    if (filters.provider) {
      conditions.push(`provider = $${index++}`);
      values.push(filters.provider);
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

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    if (filters.until) {
      conditions.push(`created_at <= $${index++}`);
      values.push(filters.until);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM payments ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, user_id, intent_id, provider, amount, currency, amount_usd,
              purpose, reference_id, status, external_payment_id, paid_at,
              refunded_amount, created_at
         FROM payments
         ${where}
        ORDER BY created_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { payments: result.rows, total, limit, offset };
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
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT status, COUNT(*)::int AS count
         FROM payments
         ${where}
        GROUP BY status`,
      values,
    );
    return result.rows;
  }

  async sumRevenue(filters = {}) {
    const conditions = ["status IN ('SUCCEEDED', 'CONFIRMED')"];
    const values = [];
    let index = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${index++}`);
      values.push(filters.userId);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    if (filters.until) {
      conditions.push(`created_at <= $${index++}`);
      values.push(filters.until);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT
         COALESCE(SUM(amount_usd), 0)::numeric AS gross,
         COALESCE(SUM(refunded_amount), 0)::numeric AS refunded,
         COUNT(*)::int AS count
         FROM payments
         ${where}`,
      values,
    );
    const row = result.rows[0] || {};
    const gross = Number(row.gross || 0);
    const refunded = Number(row.refunded || 0);
    return {
      gross: Number(gross.toFixed(2)),
      refunded: Number(refunded.toFixed(2)),
      net: Number((gross - refunded).toFixed(2)),
      count: row.count || 0,
    };
  }

  async createWebhookEvent(data) {
    const result = await this.db.query(
      `INSERT INTO payment_events (
         provider, external_event_id, event_type, status, payload,
         processed, error, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (provider, external_event_id) DO NOTHING
       RETURNING id, provider, external_event_id, event_type, status, processed, created_at`,
      [
        data.provider,
        data.externalEventId,
        data.eventType,
        data.status || 'PENDING',
        data.payload ? JSON.stringify(data.payload) : null,
        data.processed === true,
        data.error || null,
      ],
    );
    return result.rows[0] || null;
  }

  async findWebhookEvent(provider, externalEventId) {
    const result = await this.db.query(
      `SELECT id, provider, external_event_id, event_type, status, processed, error, created_at
         FROM payment_events
        WHERE provider = $1 AND external_event_id = $2
        LIMIT 1`,
      [provider, externalEventId],
    );
    return result.rows[0] || null;
  }

  async updateWebhookEvent(eventId, data) {
    const fields = [];
    const values = [eventId];
    let index = 2;

    if (data.status !== undefined) {
      fields.push(`status = $${index++}`);
      values.push(data.status);
    }
    if (data.processed !== undefined) {
      fields.push(`processed = $${index++}`);
      values.push(data.processed);
    }
    if (data.error !== undefined) {
      fields.push(`error = $${index++}`);
      values.push(data.error);
    }

    if (fields.length === 0) {
      return null;
    }

    await this.db.query(
      `UPDATE payment_events SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findWebhookEventById(eventId);
  }

  async findWebhookEventById(eventId) {
    const result = await this.db.query(
      `SELECT id, provider, external_event_id, event_type, status, processed, error, created_at
         FROM payment_events
        WHERE id = $1
        LIMIT 1`,
      [eventId],
    );
    return result.rows[0] || null;
  }

  async listWebhookEvents(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.provider) {
      conditions.push(`provider = $${index++}`);
      values.push(filters.provider);
    }

    if (filters.processed !== undefined) {
      conditions.push(`processed = $${index++}`);
      values.push(filters.processed);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 50, 1), 500);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const result = await this.db.query(
      `SELECT id, provider, external_event_id, event_type, status, processed, error, created_at
         FROM payment_events
         ${where}
        ORDER BY created_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { events: result.rows, limit, offset };
  }

  async createInvoice(data) {
    const result = await this.db.query(
      `INSERT INTO payment_invoices (
         user_id, payment_id, number, status, amount, currency, amount_usd,
         tax_amount, total_amount, issued_at, due_at, paid_at, line_items,
         metadata, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
       )
       RETURNING id, user_id, payment_id, number, status, amount, currency,
                 total_amount, issued_at, due_at, created_at`,
      [
        data.userId,
        data.paymentId || null,
        data.number,
        data.status || 'DRAFT',
        data.amount,
        data.currency || 'USD',
        data.amountUsd ?? null,
        data.taxAmount ?? 0,
        data.totalAmount ?? data.amount,
        data.issuedAt || new Date(),
        data.dueAt || null,
        data.paidAt || null,
        data.lineItems ? JSON.stringify(data.lineItems) : null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findInvoiceById(invoiceId) {
    const result = await this.db.query(
      `SELECT id, user_id, payment_id, number, status, amount, currency,
              amount_usd, tax_amount, total_amount, issued_at, due_at, paid_at,
              line_items, metadata, created_at, updated_at
         FROM payment_invoices
        WHERE id = $1
        LIMIT 1`,
      [invoiceId],
    );
    return result.rows[0] || null;
  }

  async findInvoiceByNumber(number) {
    const result = await this.db.query(
      `SELECT id, user_id, payment_id, number, status, amount, currency,
              total_amount, issued_at, due_at, paid_at, created_at
         FROM payment_invoices
        WHERE number = $1
        LIMIT 1`,
      [number],
    );
    return result.rows[0] || null;
  }

  async updateInvoice(invoiceId, data) {
    const fields = [];
    const values = [invoiceId];
    let index = 2;

    const mapping = {
      status: 'status',
      paidAt: 'paid_at',
      dueAt: 'due_at',
      totalAmount: 'total_amount',
      taxAmount: 'tax_amount',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.lineItems !== undefined) {
      fields.push(`line_items = $${index++}`);
      values.push(data.lineItems ? JSON.stringify(data.lineItems) : null);
    }
    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return this.findInvoiceById(invoiceId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE payment_invoices SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findInvoiceById(invoiceId);
  }

  async listInvoices(userId, filters = {}, pagination = {}) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    if (filters.since) {
      conditions.push(`issued_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM payment_invoices ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, user_id, payment_id, number, status, amount, currency,
              total_amount, issued_at, due_at, paid_at, created_at
         FROM payment_invoices
         ${where}
        ORDER BY issued_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { invoices: result.rows, total, limit, offset };
  }

  async createRefund(data) {
    const result = await this.db.query(
      `INSERT INTO payment_refunds (
         payment_id, user_id, amount, currency, amount_usd, reason, status,
         external_refund_id, requested_by, processed_at, error, metadata,
         created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
       )
       RETURNING id, payment_id, user_id, amount, currency, status, created_at`,
      [
        data.paymentId,
        data.userId,
        data.amount,
        data.currency || 'USD',
        data.amountUsd ?? null,
        data.reason || null,
        data.status || 'PENDING',
        data.externalRefundId || null,
        data.requestedBy || null,
        data.processedAt || null,
        data.error || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findRefundById(refundId) {
    const result = await this.db.query(
      `SELECT id, payment_id, user_id, amount, currency, amount_usd, reason,
              status, external_refund_id, requested_by, processed_at, error,
              metadata, created_at, updated_at
         FROM payment_refunds
        WHERE id = $1
        LIMIT 1`,
      [refundId],
    );
    return result.rows[0] || null;
  }

  async findRefundsByPayment(paymentId) {
    const result = await this.db.query(
      `SELECT id, payment_id, amount, currency, amount_usd, status,
              external_refund_id, processed_at, created_at
         FROM payment_refunds
        WHERE payment_id = $1
        ORDER BY created_at DESC`,
      [paymentId],
    );
    return result.rows;
  }

  async updateRefund(refundId, data) {
    const fields = [];
    const values = [refundId];
    let index = 2;

    const mapping = {
      status: 'status',
      externalRefundId: 'external_refund_id',
      processedAt: 'processed_at',
      error: 'error',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return this.findRefundById(refundId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE payment_refunds SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findRefundById(refundId);
  }

  async sumRefundsForPayment(paymentId) {
    const result = await this.db.query(
      `SELECT COALESCE(SUM(amount_usd), 0)::numeric AS total
         FROM payment_refunds
        WHERE payment_id = $1
          AND status IN ('COMPLETED', 'PROCESSING')`,
      [paymentId],
    );
    return Number(result.rows[0]?.total || 0);
  }
}

export default PaymentRepository;