/**
 * Monthly Referral Settlement Service
 *
 * @module signalforge/server/modules/referrals/settlement/monthly
 */

import { ReferralSettlementRepository } from './repository.js';
import { SettlementFreezeService } from './freeze.js';
import { ReferralRewardService } from '../rewards/service.js';
import { ReferralRelationshipService } from '../relationships/service.js';
import { ReferralWalletService } from '../wallets/service.js';
import { ReferralLedgerEntryService } from '../ledger/entry-service.js';
import { FraudDetectionService } from '../fraud/detection.js';
import { PerformanceService } from '../../performance/performance.service.js';
import {
  REFERRAL_SETTLEMENT_STATUSES,
  REFERRAL_REWARD_STATUSES,
  DEFAULT_REFERRAL_REWARD_RATE,
} from '../referral.constants.js';
import {
  SettlementAlreadyRunningError,
  ReferralRewardCalculationError,
} from '../referral.errors.js';
import {
  emitSettlementStarted,
  emitSettlementCompleted,
  emitSettlementFailed,
  emitRewardSettled,
} from '../referral.events.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class MonthlySettlementService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new ReferralSettlementRepository();
    this.freeze = dependencies.freeze || new SettlementFreezeService();
    this.rewards =
      dependencies.rewards || new ReferralRewardService(dependencies.rewardRepository);
    this.relationships =
      dependencies.relationships ||
      new ReferralRelationshipService(dependencies.relationshipRepository);
    this.wallets =
      dependencies.wallets || new ReferralWalletService(dependencies.walletRepository);
    this.ledger =
      dependencies.ledger || new ReferralLedgerEntryService(dependencies.ledgerRepository);
    this.fraud =
      dependencies.fraud || new FraudDetectionService(dependencies.fraudDependencies);
    this.performance =
      dependencies.performance ||
      new PerformanceService(dependencies.performanceDependencies);
    this.logger = getLogger('referral-monthly');
  }

  async runSettlement(settlementPeriod, options = {}) {
    const existing = await this.repository.findByPeriod(settlementPeriod);
    if (
      existing &&
      ![
        REFERRAL_SETTLEMENT_STATUSES.FAILED,
        REFERRAL_SETTLEMENT_STATUSES.CANCELLED,
      ].includes(existing.status) &&
      options.force !== true
    ) {
      if (existing.status === REFERRAL_SETTLEMENT_STATUSES.COMPLETED) {
        return { settlement: this.serialize(existing), alreadyCompleted: true };
      }
      throw new SettlementAlreadyRunningError(undefined, {
        settlementPeriod,
        status: existing.status,
      });
    }

    const freezeWindow = await this.freeze.ensureFreezeWindow(
      settlementPeriod,
      options.freezeHours,
    );

    const settlement =
      existing ||
      (await this.repository.create({
        settlementPeriod,
        status: REFERRAL_SETTLEMENT_STATUSES.STARTED,
        freezeEndedAt: freezeWindow.freezeEndedAt,
        startedAt: new Date(),
      }));

    if (!settlement) {
      const found = await this.repository.findByPeriod(settlementPeriod);
      throw new SettlementAlreadyRunningError(undefined, {
        settlementPeriod,
        status: found?.status,
      });
    }

    await this.repository.update(settlement.id, {
      status: REFERRAL_SETTLEMENT_STATUSES.IN_PROGRESS,
      startedAt: new Date(),
      freezeEndedAt: freezeWindow.freezeEndedAt,
    });

    await emitSettlementStarted(settlement.id, settlementPeriod);

    try {
      const createdRewards = await this.calculateRewardsForPeriod(settlementPeriod, {
        settlementId: settlement.id,
      });

      const totals = this.totalsFromRewards(createdRewards);

      await this.repository.update(settlement.id, {
        status: REFERRAL_SETTLEMENT_STATUSES.COMPLETED,
        completedAt: new Date(),
        totalReferrers: totals.uniqueReferrers,
        totalRewards: totals.rewardCount,
        totalAmount: totals.totalAmount,
        summary: {
          rewards: totals,
          createdAt: new Date().toISOString(),
        },
      });

      await emitSettlementCompleted(settlement.id, settlementPeriod, totals);

      const updated = await this.repository.findById(settlement.id);
      return { settlement: this.serialize(updated), rewards: createdRewards };
    } catch (error) {
      await this.repository.update(settlement.id, {
        status: REFERRAL_SETTLEMENT_STATUSES.FAILED,
        error: error.message,
      });
      await emitSettlementFailed(settlement.id, settlementPeriod, error);
      throw error;
    }
  }

  async calculateRewardsForPeriod(settlementPeriod, context = {}) {
    const { year, month } = this.freeze.parsePeriod(settlementPeriod);

    const relationships = await this.listAllActiveRelationships();

    const createdRewards = [];

    for (const relationship of relationships) {
      try {
        const performance = await this.performance.getSettlementForPeriod(
          relationship.referred_user_id,
          settlementPeriod,
        );

        const eligibleNetProfit = Number(performance?.eligibleNetProfit || 0);
        if (eligibleNetProfit <= 0) {
          continue;
        }

        const fraud = await this.fraud.runChecks({
          referrerId: relationship.referrer_id,
          referredUserId: relationship.referred_user_id,
          relationshipId: relationship.id,
          settlementPeriod,
          context: {
            referredUserTradeCount: performance?.tradeCount || 0,
            referrerRecentReferrals: 0,
            hoursSinceSignup: 24,
          },
        });

        const reward = await this.rewards.calculateAndCreate({
          referrerId: relationship.referrer_id,
          referredUserId: relationship.referred_user_id,
          relationshipId: relationship.id,
          settlementId: context.settlementId || null,
          settlementPeriod,
          currency: performance?.currency || 'USD',
          grossProfit: performance?.grossProfit || 0,
          grossLoss: performance?.grossLoss || 0,
          eligibleCosts: performance?.tradingCosts || 0,
          eligibleNetProfit,
          rewardRate: DEFAULT_REFERRAL_REWARD_RATE,
          fraudScore: fraud.fraudScore,
          fraudFlags: fraud.flags.map((f) => f.flagType),
        });

        if (
          reward.status === REFERRAL_REWARD_STATUSES.CALCULATED ||
          reward.status === REFERRAL_REWARD_STATUSES.UNDER_REVIEW
        ) {
          createdRewards.push(reward);
        }
      } catch (error) {
        this.logger.error(
          {
            err: error,
            referrerId: relationship.referrer_id,
            referredUserId: relationship.referred_user_id,
          },
          'Reward calculation failed for relationship',
        );
      }
    }

    return createdRewards;
  }

  async finalizeRewards(settlementPeriod) {
    const rewards = await this.rewards.listRewardsForSettlement(settlementPeriod, {}, {
      limit: 1000,
      offset: 0,
    });

    const settled = [];
    for (const reward of rewards.rewards) {
      if (
        reward.status !== REFERRAL_REWARD_STATUSES.APPROVED &&
        reward.status !== REFERRAL_REWARD_STATUSES.CALCULATED
      ) {
        continue;
      }

      const wallet = await this.wallets.ensureWallet(reward.referrerId, reward.currency);
      const updated = await this.wallets.creditPending(
        reward.referrerId,
        reward.rewardAmount,
        { currency: reward.currency },
      );

      const entry = await this.ledger.createRewardCredit({
        walletId: wallet.id,
        userId: reward.referrerId,
        amount: reward.rewardAmount,
        currency: reward.currency,
        referenceType: 'REFERRAL_REWARD',
        referenceId: reward.id,
        description: `Referral reward ${reward.id} for period ${settlementPeriod}`,
      });

      await this.rewards.repository.update(reward.id, {
        status: REFERRAL_REWARD_STATUSES.SETTLED,
        settledAt: new Date(),
        ledgerEntryId: entry.id,
      });

      await emitRewardSettled(
        reward.referrerId,
        reward.id,
        reward.rewardAmount,
        entry.id,
      );

      settled.push({ ...reward, ledgerEntryId: entry.id });
    }

    return { settled: settled.length, rewards: settled };
  }

  async listAllActiveRelationships() {
    const result = await this.repository.referralRepository.db.query(
      `SELECT id, referrer_id, referred_user_id, referral_code, status
         FROM referral_relationships
        WHERE status = 'ACTIVE'
        ORDER BY created_at ASC`,
    );
    return result.rows;
  }

  totalsFromRewards(rewards) {
    const uniqueReferrers = new Set();
    let totalAmount = 0;
    for (const reward of rewards) {
      uniqueReferrers.add(reward.referrerId);
      totalAmount += Number(reward.rewardAmount || 0);
    }
    return {
      rewardCount: rewards.length,
      uniqueReferrers: uniqueReferrers.size,
      totalAmount: Number(totalAmount.toFixed(8)),
    };
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      settlementPeriod: row.settlement_period,
      status: row.status,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      totalReferrers: row.total_referrers,
      totalRewards: row.total_rewards,
      totalAmount: row.total_amount,
      currency: row.currency,
      freezeEndedAt: row.freeze_ended_at,
      summary: this.parseJson(row.summary),
      error: row.error,
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

export { ReferralRewardCalculationError };

export default MonthlySettlementService;