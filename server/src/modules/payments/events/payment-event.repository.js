/**
 * Payment Event Repository
 *
 * @module signalforge/server/modules/payments/events/repository
 */
const { PaymentRepository } = require('../payment.repository.js');
class PaymentEventRepository {
  constructor(db = null) {
    this.paymentRepository = new PaymentRepository(db);
  }

  async create(data) {
    return this.paymentRepository.createWebhookEvent(data);
  }

  async find(provider, externalEventId) {
    return this.paymentRepository.findWebhookEvent(provider, externalEventId);
  }

  async findById(eventId) {
    return this.paymentRepository.findWebhookEventById(eventId);
  }

  async update(eventId, data) {
    return this.paymentRepository.updateWebhookEvent(eventId, data);
  }

  async list(filters, pagination) {
    return this.paymentRepository.listWebhookEvents(filters, pagination);
  }
}
module.exports = PaymentEventRepository;
module.exports.PaymentEventRepository = PaymentEventRepository;
