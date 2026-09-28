/**
 * Referral Code Repository
 *
 * @module signalforge/server/modules/referrals/codes/repository
 */

import { ReferralRepository } from '../referral.repository.js';

export class ReferralCodeRepository {
  constructor(db = null) {
    this.referralRepository = new ReferralRepository(db);
  }

  async create(data) {
    return this.referralRepository.createCode(data);
  }

  async findByCode(code) {
    return this.referralRepository.findCodeByCode(code);
  }

  async findByUserId(userId) {
    return this.referralRepository.findCodeByUserId(userId);
  }

  async listForUser(userId) {
    return this.referralRepository.listCodesForUser(userId);
  }

  async update(codeId, data) {
    return this.referralRepository.updateCode(codeId, data);
  }

  async incrementUsage(codeId) {
    return this.referralRepository.incrementCodeUsage(codeId);
  }
}

export default ReferralCodeRepository;