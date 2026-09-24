/**
 * Referral Settlement Repository
 *
 * @module signalforge/server/modules/referrals/settlement/repository
 */

import { ReferralRepository } from '../referral.repository.js';

export class ReferralSettlementRepository {
  constructor(db = null) {
    this.referralRepository = new ReferralRepository(db);
  }

  async create(data) {
    return this.referralRepository.createSettlement(data);
  }

  async findById(settlementId) {
    return this.referralRepository.findSettlementById(settlementId);
  }

  async findByPeriod(settlementPeriod) {
    return this.referralRepository.findSettlementByPeriod(settlementPeriod);
  }

  async update(settlementId, data) {
    return this.referralRepository.updateSettlement(settlementId, data);
  }

  async list(filters, pagination) {
    return this.referralRepository.listSettlements(filters, pagination);
  }
}

export default ReferralSettlementRepository;