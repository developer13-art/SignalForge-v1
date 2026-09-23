/**
 * Invoice Service
 *
 * @module signalforge/server/modules/payments/invoices/service
 */

import crypto from 'node:crypto';

import { InvoiceRepository } from './repository.js';
import { PaymentRepository } from '../payment.repository.js';
import {
  INVOICE_STATUSES,
  DEFAULT_INVOICE_PREFIX,
  DEFAULT_INVOICE_DUE_DAYS,
} from '../payment.constants.js';
import { InvoiceNotFoundError } from '../payment.errors.js';
import {
  emitInvoiceCreated,
  emitInvoicePaid,
  emitInvoiceVoided,
} from '../payment.events.js';

export class InvoiceService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new InvoiceRepository();
    this.paymentRepository = dependencies.paymentRepository || new PaymentRepository();
  }

  generateNumber() {
    const year = new Date().getUTCFullYear();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${DEFAULT_INVOICE_PREFIX}-${year}-${random}`;
  }

  async createForPayment(userId, payment, payload = {}) {
    const number = this.generateNumber();
    const issuedAt = new Date();
    const dueAt = new Date(
      issuedAt.getTime() + DEFAULT_INVOICE_DUE_DAYS * 24 * 60 * 60 * 1000,
    );

    const lineItems = payload.lineItems || [
      {
        description: payload.description || 'SignalForge subscription',
        amount: payment.amount,
        currency: payment.currency,
      },
    ];

    const created = await this.repository.create({
      userId,
      paymentId: payment.id,
      number,
      status: INVOICE_STATUSES.OPEN,
      amount: payment.amount,
      currency: payment.currency,
      amountUsd: payment.amount_usd,
      taxAmount: 0,
      totalAmount: payment.amount,
      issuedAt,
      dueAt,
      lineItems,
      metadata: { purpose: payment.purpose, referenceId: payment.reference_id },
    });

    await emitInvoiceCreated(userId, created.id, number);
    return created;
  }

  async getInvoice(userId, invoiceId) {
    const invoice = await this.repository.findById(invoiceId);
    if (!invoice || invoice.user_id !== userId) {
      throw new InvoiceNotFoundError();
    }
    return this.serialize(invoice);
  }

  async listInvoices(userId, filters = {}, pagination = {}) {
    const result = await this.repository.list(userId, filters, pagination);
    return {
      invoices: result.invoices.map((i) => this.serialize(i)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async markPaid(invoiceId) {
    const invoice = await this.repository.findById(invoiceId);
    if (!invoice) {
      throw new InvoiceNotFoundError();
    }
    if (invoice.status === INVOICE_STATUSES.PAID) {
      return invoice;
    }

    await this.repository.update(invoice.id, {
      status: INVOICE_STATUSES.PAID,
      paidAt: new Date(),
    });

    await emitInvoicePaid(invoice.user_id, invoice.id, invoice.number);

    const updated = await this.repository.findById(invoice.id);
    return this.serialize(updated);
  }

  async voidInvoice(userId, invoiceId) {
    const invoice = await this.repository.findById(invoiceId);
    if (!invoice || invoice.user_id !== userId) {
      throw new InvoiceNotFoundError();
    }
    if (invoice.status === INVOICE_STATUSES.PAID) {
      throw new Error('Cannot void a paid invoice');
    }
    await this.repository.update(invoice.id, { status: INVOICE_STATUSES.VOID });
    await emitInvoiceVoided(userId, invoice.id, invoice.number);
    const updated = await this.repository.findById(invoice.id);
    return this.serialize(updated);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      paymentId: row.payment_id,
      number: row.number,
      status: row.status,
      amount: row.amount,
      currency: row.currency,
      amountUsd: row.amount_usd,
      taxAmount: row.tax_amount,
      totalAmount: row.total_amount,
      issuedAt: row.issued_at,
      dueAt: row.due_at,
      paidAt: row.paid_at,
      lineItems: this.parseJson(row.line_items),
      metadata: this.parseJson(row.metadata),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  parseJson(input) {
    if (!input) {
      return null;
    }
    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch {
        return null;
      }
    }
    return input;
  }
}

export default InvoiceService;