/**
 * Referral Service (facade)
 *
 * @module signalforge/server/modules/referrals/service
 */

import { ReferralRepository } from './referral.repository.js';
import { ReferralCodeService } from './codes/service.js';
import { ReferralRelationshipService } from './relationships/service.js';
import { ReferralRewardService } from './rewards/service.js';
import { ReferralWalletService } from './wallets/service.js';
import { ReferralLedgerService } from './ledger/service.js';
import { ReferralSettlementService } from './settlement/service.js';
import { FraudDetectionService } from './fraud/detection.js';
import { ReviewQueueService } from './fraud/review-queue.service.js';
import {
  REFERRAL_RELATIONSHIP_STATUSES,
} from './referral.constants.js';

export class ReferralService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new ReferralRepository();

    this.codes =
      dependencies.codes ||
      new ReferralCodeService(dependencies.codeRepository);

    this.relationships =
      dependencies.relationships ||
      new ReferralRelationshipService(
        dependencies.relationshipRepository,
        this.codes,
      );

    this.rewards =
      dependencies.rewards ||
      new ReferralRewardService(dependencies.rewardRepository);

    this.wallets =
      dependencies.wallets ||
      new ReferralWalletService(dependencies.walletRepository);

    this.ledger =
      dependencies.ledger ||
      new ReferralLedgerService(dependencies.ledgerDependencies);

    this.settlements =
      dependencies.settlements ||
      new ReferralSettlementService({
        repository: dependencies.settlementRepository,
      });

    this.fraud =
      dependencies.fraud ||
      new FraudDetectionService({
        repository: this.repository,
        ...dependencies.fraudDependencies,
      });

    this.reviews =
      dependencies.reviews || new ReviewQueueService(dependencies.db);
  }

  async getOrCreateCode(userId) {
    return this.codes.getOrCreateForUser(userId);
  }

  async regenerateCode(userId) {
    return this.codes.regenerate(userId);
  }

  async listCodes(userId) {
    return this.codes.listCodesForUser(userId);
  }

  async createRelationship(referredUserId, referralCode, context) {
    return this.relationships.createRelationship(referredUserId, referralCode, context);
  }

  async getRelationshipForUser(referredUserId) {
    return this.relationships.getRelationshipForUser(referredUserId);
  }

  async listReferralsForUser(referrerId, filters = {}) {
    return this.relationships.listRelationshipsForReferrer(referrerId, filters);
  }

  async getReferralDashboard(referrerId) {
    const [code, relationships, rewardSummary, wallet] = await Promise.all([
      this.codes.getOrCreateForUser(referrerId),
      this.relationships.listRelationshipsForReferrer(referrerId, {
        status: REFERRAL_RELATIONSHIP_STATUSES.ACTIVE,
      }),
      this.rewards.getReferrerSummary(referrerId),
      this.wallets.ensureWallet(referrerId),
    ]);

    return {
      code,
      activeReferrals: relationships.length,
      totalReferrals: relationships.length,
      rewardSummary,
      wallet,
    };
  }

  async listRewardsForUser(referrerId, filters = {}, pagination = {}) {
    return this.rewards.listRewardsForReferrer(referrerId, filters, pagination);
  }

  async getReward(rewardId) {
    return this.rewards.getRewardById(rewardId);
  }

  async approveReward(rewardId, actorId) {
    return this.rewards.approve(rewardId, actorId);
  }

  async rejectReward(rewardId, actorId, reason) {
    return this.rewards.reject(rewardId, actorId, reason);
  }

  async reverseReward(rewardId, actorId, reason) {
    return this.rewards.reverse(rewardId, actorId, reason);
  }

  async getWallet(userId, currency = 'USD') {
    return this.wallets.ensureWallet(userId, currency);
  }

  async listLedger(walletId, filters = {}, pagination = {}) {
    return this.ledger.listEntries(walletId, filters, pagination);
  }

  async runSettlement(settlementPeriod, options = {}) {
    return this.settlements.runSettlement(settlementPeriod, options);
  }

  async finalizeSettlement(settlementPeriod) {
    return this.settlements.finalizeRewards(settlementPeriod);
  }

  async listSettlements(filters = {}, pagination = {}) {
    return this.settlements.listSettlements(filters, pagination);
  }

  async getSettlement(settlementId) {
    return this.settlements.getSettlementById(settlementId);
  }

  async listRewardsForSettlement(settlementPeriod, filters = {}, pagination = {}) {
    return this.rewards.listRewardsForSettlement(settlementPeriod, filters, pagination);
  }

  async listFraudFlags(filters = {}, pagination = {}) {
    return this.fraud.listFlags(filters, pagination);
  }

  async listOpenFraudFlags(filters = {}, pagination = {}) {
    return this.reviews.listOpenFlags(filters, pagination);
  }

  async assignFraudFlag(flagId, reviewerId) {
    return this.reviews.assign(flagId, reviewerId);
  }

  async resolveFraudFlag(flagId, resolution, metadata) {
    return this.reviews.resolve(flagId, resolution, metadata);
  }

  async runFraudChecks(payload) {
    return this.fraud.runChecks(payload);
  }
}

export default ReferralService;