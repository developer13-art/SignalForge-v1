/**
 * Referral Reward Service
 *
 * @module signalforge/server/modules/referrals/rewards/service
 */

import { ReferralRewardRepository } from './repository.js';
import { RewardCalculatorService } from './calculator.js';
import {
  REFERRAL_REWARD_STATUSES,
  DEFAULT_REFERRAL_REWARD_RATE,
} from '../referral.constants.js';
import {
  ReferralRewardNotFoundError,
  RewardAlreadySettledError,
} from '../referral.errors.js';
import {
  emitRewardCalculated,
  emitRewardApproved,
  emitRewardRejected,
  emitRewardReversed,
  emitRewardUnderReview,
} from '../referral.events.js';

export class ReferralRewardService {
  constructor(repository = null, calculator = null) {
    this.repository = repository || new ReferralRewardRepository();
    this.calculator = calculator || new RewardCalculatorService();
  }

  async calculateAndCreate(data) {
    const existing = await this.repository.findByKey(
      data.referrerId,
      data.referredUserId,
      data.settlementPeriod,
    );
    if (existing) {
      return this.serialize(existing);
    }

    const calculated = this.calculator.calculate({
      eligibleNetProfit: data.eligibleNetProfit,
      rewardRate: data.rewardRate || DEFAULT_REFERRAL_REWARD_RATE,
    });

    const requiresReview =
      Array.isArray(data.fraudFlags) && data.fraudFlags.length > 0;

    const created = await this.repository.create({
      referrerId: data.referrerId,
      referredUserId: data.referredUserId,
      relationshipId: data.relationshipId || null,
      settlementId: data.settlementId || null,
      settlementPeriod: data.settlementPeriod,
      currency: data.currency || 'USD',
      grossProfit: data.grossProfit ?? null,
      grossLoss: data.grossLoss ?? null,
      eligibleCosts: data.eligibleCosts ?? null,
      eligibleNetProfit: calculated.eligibleNetProfit,
      rewardRate: calculated.rewardRate,
      rewardAmount: calculated.rewardAmount,
      status: requiresReview
        ? REFERRAL_REWARD_STATUSES.UNDER_REVIEW
        : REFERRAL_REWARD_STATUSES.CALCULATED,
      fraudScore: data.fraudScore ?? null,
      fraudFlags: data.fraudFlags || null,
      metadata: { capped: calculated.capped },
    });

    if (!created) {
      const found = await this.repository.findByKey(
        data.referrerId,
        data.referredUserId,
        data.settlementPeriod,
      );
      return this.serialize(found);
    }

    await emitRewardCalculated(
      data.referrerId,
      created.id,
      created.reward_amount,
      data.settlementPeriod,
    );

    if (requiresReview) {
      await emitRewardUnderReview(data.referrerId, created.id, data.fraudFlags);
    }

    return this.serialize(created);
  }

  async getRewardById(rewardId) {
    const row = await this.repository.findById(rewardId);
    if (!row) {
      throw new ReferralRewardNotFoundError();
    }
    return this.serialize(row);
  }

  async listRewardsForReferrer(referrerId, filters = {}, pagination = {}) {
    const result = await this.repository.listByReferrer(referrerId, filters, pagination);
    return {
      rewards: result.rewards.map((r) => this.serialize(r)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async listRewardsForSettlement(settlementPeriod, filters = {}, pagination = {}) {
    const result = await this.repository.listForSettlement(
      settlementPeriod,
      filters,
      pagination,
    );
    return {
      rewards: result.rewards.map((r) => this.serialize(r)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async getReferrerSummary(referrerId, filters = {}) {
    const summary = await this.repository.sumByReferrer(referrerId, filters);
    return summary;
  }

  async approve(rewardId, actorId) {
    const reward = await this.repository.findById(rewardId);
    if (!reward) {
      throw new ReferralRewardNotFoundError();
    }
    if (reward.status === REFERRAL_REWARD_STATUSES.SETTLED) {
      throw new RewardAlreadySettledError();
    }

    await this.repository.update(reward.id, {
      status: REFERRAL_REWARD_STATUSES.APPROVED,
      reviewedBy: actorId,
      approvedAt: new Date(),
    });

    await emitRewardApproved(reward.referrer_id, reward.id, actorId);

    const updated = await this.repository.findById(reward.id);
    return this.serialize(updated);
  }

  async reject(rewardId, actorId, reason) {
    const reward = await this.repository.findById(rewardId);
    if (!reward) {
      throw new ReferralRewardNotFoundError();
    }
    if (reward.status === REFERRAL_REWARD_STATUSES.SETTLED) {
      throw new RewardAlreadySettledError();
    }

    await this.repository.update(reward.id, {
      status: REFERRAL_REWARD_STATUSES.REJECTED,
      reviewedBy: actorId,
      rejectedAt: new Date(),
      rejectionReason: reason || null,
    });

    await emitRewardRejected(reward.referrer_id, reward.id, actorId, reason);

    const updated = await this.repository.findById(reward.id);
    return this.serialize(updated);
  }

  async reverse(rewardId, actorId, reason) {
    const reward = await this.repository.findById(rewardId);
    if (!reward) {
      throw new ReferralRewardNotFoundError();
    }

    await this.repository.update(reward.id, {
      status: REFERRAL_REWARD_STATUSES.REVERSED,
      reversalReason: reason || null,
      reviewedBy: actorId,
    });

    await emitRewardReversed(reward.referrer_id, reward.id, reason);

    const updated = await this.repository.findById(reward.id);
    return this.serialize(updated);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      referrerId: row.referrer_id,
      referredUserId: row.referred_user_id,
      relationshipId: row.relationship_id,
      settlementId: row.settlement_id,
      settlementPeriod: row.settlement_period,
      currency: row.currency,
      grossProfit: row.gross_profit,
      grossLoss: row.gross_loss,
      eligibleCosts: row.eligible_costs,
      eligibleNetProfit: row.eligible_net_profit,
      rewardRate: row.reward_rate,
      rewardAmount: row.reward_amount,
      status: row.status,
      fraudScore: row.fraud_score,
      fraudFlags: this.parseJson(row.fraud_flags),
      reviewedBy: row.reviewed_by,
      approvedAt: row.approved_at,
      settledAt: row.settled_at,
      rejectedAt: row.rejected_at,
      rejectionReason: row.rejection_reason,
      reversalReason: row.reversal_reason,
      ledgerEntryId: row.ledger_entry_id,
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

export default ReferralRewardService;