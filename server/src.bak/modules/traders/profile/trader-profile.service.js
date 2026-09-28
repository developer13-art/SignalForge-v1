/**
 * Trader Profile Service
 *
 * @module signalforge/server/modules/traders/profile/service
 */

import { TraderProfileRepository } from './repository.js';
import { TraderNotFoundError, TraderNotOwnedError } from '../trader.errors.js';
import {
  emitTraderProfileUpdated,
  emitTraderAvatarUpdated,
  emitTraderAvatarRemoved,
} from '../trader.events.js';

export class TraderProfileService {
  constructor(repository = null) {
    this.repository = repository || new TraderProfileRepository();
  }

  async getProfile(traderId) {
    const row = await this.repository.findById(traderId);
    if (!row) {
      throw new TraderNotFoundError();
    }
    return this.serialize(row);
  }

  async getProfileBySlug(slug) {
    const row = await this.repository.findBySlug(slug);
    if (!row) {
      throw new TraderNotFoundError();
    }
    return this.serialize(row);
  }

  async getProfileByUserId(userId) {
    const row = await this.repository.findByUserId(userId);
    if (!row) {
      throw new TraderNotFoundError();
    }
    return this.serialize(row);
  }

  async updateProfile(userId, traderId, payload) {
    const trader = await this.repository.findById(traderId);
    if (!trader) {
      throw new TraderNotFoundError();
    }
    if (trader.user_id !== userId) {
      throw new TraderNotOwnedError();
    }
    await this.repository.update(traderId, payload);
    const updated = await this.repository.findById(traderId);
    await emitTraderProfileUpdated(traderId, Object.keys(payload));
    return this.serialize(updated);
  }

  async updateAvatar(userId, traderId, avatarUrl) {
    const trader = await this.repository.findById(traderId);
    if (!trader) {
      throw new TraderNotFoundError();
    }
    if (trader.user_id !== userId) {
      throw new TraderNotOwnedError();
    }
    await this.repository.update(traderId, { avatarUrl });
    await emitTraderAvatarUpdated(traderId, avatarUrl);
    const updated = await this.repository.findById(traderId);
    return this.serialize(updated);
  }

  async removeAvatar(userId, traderId) {
    const trader = await this.repository.findById(traderId);
    if (!trader) {
      throw new TraderNotFoundError();
    }
    if (trader.user_id !== userId) {
      throw new TraderNotOwnedError();
    }
    await this.repository.update(traderId, { avatarUrl: null });
    await emitTraderAvatarRemoved(traderId);
    const updated = await this.repository.findById(traderId);
    return this.serialize(updated);
  }

  async listPublic(filters = {}, pagination = {}) {
    const result = await this.repository.list(
      {
        ...filters,
        status: ['APPROVED', 'ACTIVE'],
        visibility: 'PUBLIC',
      },
      pagination,
    );
    return {
      traders: result.traders.map((t) => this.serialize(t)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
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

export default TraderProfileService;