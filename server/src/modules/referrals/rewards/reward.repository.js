/**
 * Referral Reward Repository
 *
 * @module signalforge/server/modules/referrals/rewards/repository
 */

import { ReferralRepository } from '../referral.repository.js';

export class ReferralRewardRepository {
  constructor(db = null) {
    this.referralRepository = new ReferralRepository(db);
  }

  async create(data) {
    return this.referralRepository.createReward(data);
  }

  async findById(rewardId) {
    return this.referralRepository.findRewardById(rewardId);
  }

  async findByKey(referrerId, referredUserId, settlementPeriod) {
    return this.referralRepository.findRewardByKey(
      referrerId,
      referredUserId,
      settlementPeriod,
    );
  }

  async listByReferrer(referrerId, filters, pagination) {
    return this.referralRepository.listRewardsByReferrer(
      referrerId,
      filters,
      pagination,
    );
  }

  async listForSettlement(settlementPeriod, filters, pagination) {
    return this.referralRepository.listRewardsForSettlement(
      settlementPeriod,
      filters,
      pagination,
    );
  }

  async update(rewardId, data) {
    return this.referralRepository.updateReward(rewardId, data);
  }

  async sumByReferrer(referrerId, filters) {
    return this.referralRepository.sumRewardsByReferrer(referrerId, filters);
  }
}

export default ReferralRewardRepository;