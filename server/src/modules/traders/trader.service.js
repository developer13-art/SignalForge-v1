/**
 * Trader Service (facade)
 *
 * @module signalforge/server/modules/traders/service
 */

import { TraderRepository } from './trader.repository.js';
import { TraderProfileService } from './profile/service.js';
import { FollowerService } from './followers/service.js';
import { LeaderboardService } from './leaderboard/service.js';
import { CopySettingsService } from './copy-settings/service.js';
import {
  TRADER_STATUSES,
} from './trader.constants.js';
import {
  TraderNotFoundError,
  TraderAlreadyRegisteredError,
  TraderNotActiveError,
} from './trader.errors.js';
import {
  emitTraderRegistered,
  emitTraderUpdated,
  emitTraderApproved,
  emitTraderSuspended,
  emitTraderReinstated,
} from './trader.events.js';

export class TraderService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new TraderRepository();

    this.profile =
      dependencies.profile ||
      new TraderProfileService(dependencies.profileRepository);

    this.followers =
      dependencies.followers ||
      new FollowerService(dependencies.followerRepository, this.repository);

    this.leaderboard =
      dependencies.leaderboard ||
      new LeaderboardService(dependencies.leaderboardRepository);

    this.copySettings =
      dependencies.copySettings ||
      new CopySettingsService(dependencies.copySettingsRepository);
  }

  async register(userId, payload) {
    const existing = await this.repository.findByUserId(userId);
    if (existing) {
      throw new TraderAlreadyRegisteredError();
    }

    const slug = payload.slug || this.generateSlug(payload.displayName);

    const created = await this.repository.create({
      userId,
      displayName: payload.displayName,
      slug,
      bio: payload.bio || null,
      visibility: payload.visibility || 'PUBLIC',
      language: payload.language || null,
      timezone: payload.timezone || null,
      websiteUrl: payload.websiteUrl || null,
      socialLinks: payload.socialLinks || null,
      tags: payload.tags || [],
      tradingStyle: payload.tradingStyle || null,
      riskStyle: payload.riskStyle || null,
      metadata: payload.metadata || null,
    });

    if (!created) {
      const found = await this.repository.findByUserId(userId);
      throw new TraderAlreadyRegisteredError(undefined, { traderId: found?.id });
    }

    await emitTraderRegistered(created.id, userId);

    return this.getById(created.id);
  }

  generateSlug(displayName) {
    const base = String(displayName || 'trader')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48);
    const suffix = Math.random().toString(36).slice(2, 6);
    return `${base || 'trader'}-${suffix}`;
  }

  async getById(traderId) {
    const trader = await this.repository.findById(traderId);
    if (!trader) {
      throw new TraderNotFoundError();
    }
    return this.serialize(trader);
  }

  async getByUserId(userId) {
    const trader = await this.repository.findByUserId(userId);
    return this.serialize(trader);
  }

  async listTraders(filters = {}, pagination = {}) {
    const result = await this.repository.list(filters, pagination);
    return {
      traders: result.traders.map((t) => this.serialize(t)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async approve(traderId, actorId) {
    const trader = await this.repository.findById(traderId);
    if (!trader) {
      throw new TraderNotFoundError();
    }
    await this.repository.update(traderId, {
      status: TRADER_STATUSES.APPROVED,
      approvedAt: new Date(),
    });
    await emitTraderApproved(traderId, actorId);
    const updated = await this.repository.findById(traderId);
    return this.serialize(updated);
  }

  async suspend(traderId, actorId, reason) {
    const trader = await this.repository.findById(traderId);
    if (!trader) {
      throw new TraderNotFoundError();
    }
    await this.repository.update(traderId, {
      status: TRADER_STATUSES.SUSPENDED,
      suspendedAt: new Date(),
    });
    await emitTraderSuspended(traderId, actorId, reason);
    const updated = await this.repository.findById(traderId);
    return this.serialize(updated);
  }

  async reinstate(traderId, actorId) {
    const trader = await this.repository.findById(traderId);
    if (!trader) {
      throw new TraderNotFoundError();
    }
    await this.repository.update(traderId, {
      status: TRADER_STATUSES.ACTIVE,
      suspendedAt: null,
    });
    await emitTraderReinstated(traderId, actorId);
    const updated = await this.repository.findById(traderId);
    return this.serialize(updated);
  }

  async updateTrader(traderId, payload) {
    const trader = await this.repository.findById(traderId);
    if (!trader) {
      throw new TraderNotFoundError();
    }
    await this.repository.update(traderId, payload);
    const updated = await this.repository.findById(traderId);
    await emitTraderUpdated(traderId, Object.keys(payload));
    return this.serialize(updated);
  }

  async assertActive(traderId) {
    const trader = await this.repository.findById(traderId);
    if (!trader) {
      throw new TraderNotFoundError();
    }
    if (
      ![
        TRADER_STATUSES.APPROVED,
        TRADER_STATUSES.ACTIVE,
      ].includes(trader.status)
    ) {
      throw new TraderNotActiveError(undefined, { status: trader.status });
    }
    return trader;
  }

  async countByStatus() {
    return this.repository.countByStatus();
  }

  async countByTradingStyle() {
    return this.repository.countByTradingStyle();
  }

  async follow(traderId, followerUserId, options) {
    return this.followers.follow(traderId, followerUserId, options);
  }

  async unfollow(traderId, followerUserId) {
    return this.followers.unfollow(traderId, followerUserId);
  }

  async pauseFollowing(traderId, followerUserId) {
    return this.followers.pause(traderId, followerUserId);
  }

  async resumeFollowing(traderId, followerUserId) {
    return this.followers.resume(traderId, followerUserId);
  }

  async listFollowers(traderId, filters, pagination) {
    return this.followers.listFollowers(traderId, filters, pagination);
  }

  async listFollowing(followerUserId, filters, pagination) {
    return this.followers.listFollowing(followerUserId, filters, pagination);
  }

  async getCopySettings(traderId, followerUserId) {
    return this.copySettings.getSettings(traderId, followerUserId);
  }

  async updateCopySettings(traderId, followerUserId, payload) {
    return this.copySettings.updateSettings(traderId, followerUserId, payload);
  }

  async getLeaderboard(metric, period, limit) {
    return this.leaderboard.getLeaderboard(metric, period, limit);
  }

  async getTopTraders(metric, limit) {
    return this.leaderboard.getTopTradersByMetric(metric, limit);
  }

  async getConsistencyLeaders(limit) {
    return this.leaderboard.getConsistencyLeaders(limit);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      displayName: row.display_name,
      slug: row.slug,
      bio: row.bio,
      avatarUrl: row.avatar_url,
      status: row.status,
      visibility: row.visibility,
      language: row.language,
      timezone: row.timezone,
      websiteUrl: row.website_url,
      socialLinks: this.parseJson(row.social_links),
      tags: row.tags,
      followerCount: row.follower_count,
      totalTrades: row.total_trades,
      winningTrades: row.winning_trades,
      losingTrades: row.losing_trades,
      winRate: row.win_rate,
      averageRr: row.average_rr,
      profitFactor: row.profit_factor,
      sharpeRatio: row.sharpe_ratio,
      sortinoRatio: row.sortino_ratio,
      maxDrawdownPercent: row.max_drawdown_percent,
      consistencyScore: row.consistency_score,
      behaviorScore: row.behavior_score,
      reputationScore: row.reputation_score,
      tradingStyle: row.trading_style,
      riskStyle: row.risk_style,
      metadata: this.parseJson(row.metadata),
      approvedAt: row.approved_at,
      suspendedAt: row.suspended_at,
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

export default TraderService;