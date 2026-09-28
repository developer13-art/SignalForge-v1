/**
 * Invoice Repository
 *
 * @module signalforge/server/modules/payments/invoices/repository
 */
const { PaymentRepository } = require('../payment.repository.js');
class InvoiceRepository {
  constructor(db = null) {
    this.paymentRepository = new PaymentRepository(db);
  }

  async create(data) {
    return this.paymentRepository.createInvoice(data);
  }

  async findById(invoiceId) {
    return this.paymentRepository.findInvoiceById(invoiceId);
  }

  async findByNumber(number) {
    return this.paymentRepository.findInvoiceByNumber(number);
  }

  async update(invoiceId, data) {
    return this.paymentRepository.updateInvoice(invoiceId, data);
  }

  async list(userId, filters, pagination) {
    return this.paymentRepository.listInvoices(userId, filters, pagination);
  }
}
module.exports = InvoiceRepository;
module.exports.InvoiceRepository = InvoiceRepository;
