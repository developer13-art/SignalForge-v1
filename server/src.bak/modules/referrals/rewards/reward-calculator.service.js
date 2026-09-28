/**
 * Referral Reward Calculator Service
 *
 * @module signalforge/server/modules/referrals/rewards/calculator
 */

import {
  DEFAULT_REFERRAL_REWARD_RATE,
  DEFAULT_REFERRAL_MAX_REWARD_PER_REFERRED,
} from '../referral.constants.js';

export class RewardCalculatorService {
  calculate({
    eligibleNetProfit,
    rewardRate = DEFAULT_REFERRAL_REWARD_RATE,
    maxReward = DEFAULT_REFERRAL_MAX_REWARD_PER_REFERRED,
  }) {
    const profit = Number(eligibleNetProfit || 0);
    const rate = Number(rewardRate || DEFAULT_REFERRAL_REWARD_RATE);

    if (profit <= 0 || rate <= 0) {
      return {
        eligibleNetProfit: Number(Math.max(0, profit).toFixed(2)),
        rewardRate: rate,
        rewardAmount: 0,
        capped: false,
      };
    }

    const raw = profit * rate;
    const capped = Number(maxReward) > 0 && raw > Number(maxReward);
    const rewardAmount = capped ? Number(maxReward) : raw;

    return {
      eligibleNetProfit: Number(profit.toFixed(2)),
      rewardRate: rate,
      rewardAmount: Number(rewardAmount.toFixed(8)),
      capped,
    };
  }

  summarize(rewards) {
    if (!Array.isArray(rewards) || rewards.length === 0) {
      return { count: 0, total: 0, average: 0 };
    }

    let total = 0;
    for (const reward of rewards) {
      total += Number(reward.reward_amount || reward.rewardAmount || 0);
    }
    return {
      count: rewards.length,
      total: Number(total.toFixed(8)),
      average: Number((total / rewards.length).toFixed(8)),
    };
  }
}

export default RewardCalculatorService;