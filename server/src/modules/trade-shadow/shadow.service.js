/**
 * Trade Shadow Service (facade)
 *
 * @module signalforge/server/modules/trade-shadow/service
 */

import { ShadowRepository } from './shadow.repository.js';
import { ComparisonService } from './comparison.service.js';
import { MissedProfitService } from './missed-profit.service.js';
import { BetterExitService } from './better-exit.service.js';
import { BehaviorFeedbackService } from './behavior-feedback.service.js';
import { TradeStateRepository } from '../trade-state/trade-state.repository.js';
import {
  SHADOW_OUTCOMES,
} from './shadow.constants.js';
import { ShadowNotFoundError, ShadowAlreadyExistsError } from './shadow.errors.js';
import {
  emitShadowCreated,
  emitShadowCompleted,
  emitDivergenceDetected,
  emitMissedProfitDetected,
  emitBetterExitDetected,
  emitBehaviorFeedbackGenerated,
} from './shadow.events.js';

export class ShadowService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new ShadowRepository();
    this.tradeRepository = dependencies.tradeRepository || new TradeStateRepository();
    this.comparison = dependencies.comparison || new ComparisonService(this.tradeRepository);
    this.missedProfit = dependencies.missedProfit || new MissedProfitService();
    this.betterExit = dependencies.betterExit || new BetterExitService();
    this.behavior = dependencies.behavior || new BehaviorFeedbackService();
  }

  async compareTrades(userId, providerTradeId, userTradeId, options = {}) {
    const providerTrade = await this.tradeRepository.findById(providerTradeId);
    const userTrade = await this.tradeRepository.findById(userTradeId);

    if (!providerTrade || !userTrade) {
      return {
        outcome: SHADOW_OUTCOMES.INCONCLUSIVE,
        reason: 'TRADE_NOT_FOUND',
      };
    }

    const existing = await this.repository.findByUserTrade(userTrade.id);
    if (existing) {
      throw new ShadowAlreadyExistsError();
    }

    const comparison = this.comparison.compare(providerTrade, userTrade, options);
    const missed = this.missedProfit.calculate(
      comparison.providerProfit,
      comparison.userProfit,
    );
    const better = this.betterExit.analyze(providerTrade, userTrade);

    const divergenceDetails = comparison.divergences.length > 0
      ? { divergences: comparison.divergences }
      : null;

    const created = await this.repository.create({
      providerTradeId: providerTrade.id,
      userTradeId: userTrade.id,
      userId,
      providerId: providerTrade.provider_id || null,
      providerRealizedProfit: comparison.providerProfit,
      userRealizedProfit: comparison.userProfit,
      missedProfit: missed.missedProfit,
      difference: comparison.difference,
      outcome: comparison.outcome,
      reason: comparison.reason || null,
      divergenceType: comparison.divergenceType,
      divergenceDetails,
      behaviorCategory: null,
      metadata: { better },
    });

    if (!created) {
      throw new ShadowAlreadyExistsError();
    }

    await emitShadowCreated(created.id, userId, {
      providerTradeId: providerTrade.id,
      userTradeId: userTrade.id,
    });
    await emitShadowCompleted(created.id, userId, comparison.outcome);

    if (comparison.divergenceType) {
      await emitDivergenceDetected(created.id, userId, comparison.divergenceType);
    }
    if (missed.exceedsThreshold) {
      await emitMissedProfitDetected(created.id, userId, missed.missedProfit);
    }
    if (better.better) {
      await emitBetterExitDetected(created.id, userId, better.difference);
    }

    return this.serialize(created);
  }

  async getById(shadowId) {
    const row = await this.repository.findById(shadowId);
    if (!row) {
      throw new ShadowNotFoundError();
    }
    return this.serialize(row);
  }

  async getByUserTrade(userTradeId) {
    const row = await this.repository.findByUserTrade(userTradeId);
    return this.serialize(row);
  }

  async listByProviderTrade(providerTradeId) {
    const rows = await this.repository.findByProviderTrade(providerTradeId);
    return rows.map((r) => this.serialize(r));
  }

  async listByUser(userId, filters = {}, pagination = {}) {
    const result = await this.repository.listByUser(userId, filters, pagination);
    return {
      shadows: result.shadows.map((s) => this.serialize(s)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async getUserInsights(userId, filters = {}) {
    const result = await this.repository.listByUser(userId, filters, { limit: 500, offset: 0 });
    const shadows = result.shadows;

    const outcomeCounts = await this.repository.countByOutcome(userId, filters);
    const divergenceCounts = await this.repository.countByDivergenceType(userId, filters);
    const missed = await this.repository.sumMissedProfit(userId, filters);

    const missedSummary = this.missedProfit.summarize(shadows);
    const betterSummary = this.betterExit.summarize(shadows);
    const behaviorFeedback = this.behavior.generateInsights(shadows);

    await emitBehaviorFeedbackGenerated(userId, behaviorFeedback.classification);

    return {
      userId,
      summary: {
        totalShadows: shadows.length,
        outcomeCounts,
        divergenceCounts,
        missedProfit: missed,
      },
      missedProfit: missedSummary,
      betterExit: betterSummary,
      behavior: behaviorFeedback,
    };
  }

  async recomputeShadow(shadowId) {
    const existing = await this.repository.findById(shadowId);
    if (!existing) {
      throw new ShadowNotFoundError();
    }

    const providerTrade = await this.tradeRepository.findById(existing.provider_trade_id);
    const userTrade = await this.tradeRepository.findById(existing.user_trade_id);

    if (!providerTrade || !userTrade) {
      return { recomputed: false, reason: 'TRADE_NOT_FOUND' };
    }

    const comparison = this.comparison.compare(providerTrade, userTrade);
    const missed = this.missedProfit.calculate(
      comparison.providerProfit,
      comparison.userProfit,
    );

    await this.repository.update(shadowId, {
      providerRealizedProfit: comparison.providerProfit,
      userRealizedProfit: comparison.userProfit,
      missedProfit: missed.missedProfit,
      difference: comparison.difference,
      outcome: comparison.outcome,
      divergenceType: comparison.divergenceType,
      divergenceDetails: comparison.divergences.length > 0
        ? { divergences: comparison.divergences }
        : null,
    });

    const updated = await this.repository.findById(shadowId);
    return this.serialize(updated);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      providerTradeId: row.provider_trade_id,
      userTradeId: row.user_trade_id,
      userId: row.user_id,
      providerId: row.provider_id,
      providerRealizedProfit: row.provider_realized_profit,
      userRealizedProfit: row.user_realized_profit,
      missedProfit: row.missed_profit,
      difference: row.difference,
      outcome: row.outcome,
      reason: row.reason,
      divergenceType: row.divergence_type,
      divergenceDetails: this.parseJson(row.divergence_details),
      behaviorCategory: row.behavior_category,
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

export default ShadowService;