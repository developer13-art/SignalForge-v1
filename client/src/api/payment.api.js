/**
 * Payments API
 *
 * @module client/src/api/payment.api
 */

import { get, post } from './client.js';
import { endpoints } from './endpoints.js';

export const paymentApi = {
  listPayments: (params) => get(endpoints.payments.list, { params }),

  createPayment: (payload) => post(endpoints.payments.create, payload),

  getPayment: (paymentId) => get(endpoints.payments.payment(paymentId)),

  refundPayment: (paymentId, payload) => post(endpoints.payments.refund(paymentId), payload),

  listPaymentMethods: () => get(endpoints.payments.methods),

  listInvoices: (params) => get(endpoints.payments.invoices, { params }),

  getInvoice: (invoiceId) => get(endpoints.payments.invoice(invoiceId)),
};

export default paymentApi;