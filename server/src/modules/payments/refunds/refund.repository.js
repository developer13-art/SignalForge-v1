/**
 * Refund Repository
 *
 * @module signalforge/server/modules/payments/refunds/repository
 */
const { PaymentRepository } = require('../payment.repository.js');
class RefundRepository {
  constructor(db = null) {
    this.paymentRepository = new PaymentRepository(db);
  }

  async create(data) {
    return this.paymentRepository.createRefund(data);
  }

  async findById(refundId) {
    return this.paymentRepository.findRefundById(refundId);
  }

  async findByPayment(paymentId) {
    return this.paymentRepository.findRefundsByPayment(paymentId);
  }

  async update(refundId, data) {
    return this.paymentRepository.updateRefund(refundId, data);
  }

  async sumForPayment(paymentId) {
    return this.paymentRepository.sumRefundsForPayment(paymentId);
  }
}
module.exports = RefundRepository;
module.exports.RefundRepository = RefundRepository;
