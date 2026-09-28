/**
 * Payment Intent Repository
 *
 * @module signalforge/server/modules/payments/intents/repository
 */
const { PaymentRepository } = require('../payment.repository.js');
class PaymentIntentRepository {
  constructor(db = null) {
    this.paymentRepository = new PaymentRepository(db);
  }

  async create(data) {
    return this.paymentRepository.createIntent(data);
  }

  async findById(intentId) {
    return this.paymentRepository.findIntentById(intentId);
  }

  async findByExternalId(externalIntentId) {
    return this.paymentRepository.findIntentByExternalId(externalIntentId);
  }

  async update(intentId, data) {
    return this.paymentRepository.updateIntent(intentId, data);
  }
}
module.exports = PaymentIntentRepository;
module.exports.PaymentIntentRepository = PaymentIntentRepository;
