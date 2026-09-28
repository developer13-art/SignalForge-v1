/**
 * Traders Repository
 *
 * @module signalforge/server/modules/traders/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class TraderRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async create(data) {
    const result = await this.db.query(
      `INSERT INTO trader_profiles (
         user_id, display_name, slug, bio, avatar_url, status, visibility,
         language, timezone, website_url, social_links, tags,
         follower_count, total_trades, winning_trades, losing_trades,
         win_rate, average_rr, profit_factor, sharpe_ratio, sortino_ratio,
         max_drawdown_percent, consistency_score, behavior_score,
         reputation_score, trading_style, risk_style, metadata,
         approved_at, suspended_at, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
         $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29,
         $30, NOW(), NOW()
       )
       ON CONFLICT (user_id) DO NOTHING
       RETURNING id, user_id, display_name, slug, status, created_at`,
      [
        data.userId,
        data.displayName,
        data.slug,
        data.bio || null,
        data.avatarUrl || null,
        data.status || 'PENDING',
        data.visibility || 'PUBLIC',
        data.language || null,
        data.timezone || null,
        data.websiteUrl || null,
        data.socialLinks ? JSON.stringify(data.socialLinks) : null,
        data.tags || [],
        data.followerCount ?? 0,
        data.totalTrades ?? 0,
        data.winningTrades ?? 0,
        data.losingTrades ?? 0,
        data.winRate ?? null,
        data.averageRr ?? null,
        data.profitFactor ?? null,
        data.sharpeRatio ?? null,
        data.sortinoRatio ?? null,
        data.maxDrawdownPercent ?? null,
        data.consistencyScore ?? null,
        data.behaviorScore ?? null,
        data.reputationScore ?? null,
        data.tradingStyle || null,
        data.riskStyle || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
        data.approvedAt || null,
        data.suspendedAt || null,
      ],
    );
    return result.rows[0] || null;
  }

  async findById(traderId) {
    const result = await this.db.query(
      `SELECT id, user_id, display_name, slug, bio, avatar_url, status, visibility,
              language, timezone, website_url, social_links, tags, follower_count,
              total_trades, winning_trades, losing_trades, win_rate, average_rr,
              profit_factor, sharpe_ratio, sortino_ratio, max_drawdown_percent,
              consistency_score, behavior_score, reputation_score, trading_style,
              risk_style, metadata, approved_at, suspended_at, created_at, updated_at
         FROM trader_profiles
        WHERE id = $1
        LIMIT 1`,
      [traderId],
    );
    return result.rows[0] || null;
  }

  async findByUserId(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, display_name, slug, bio, avatar_url, status, visibility,
              language, timezone, follower_count, win_rate, average_rr,
              profit_factor, sharpe_ratio, max_drawdown_percent, consistency_score,
              trading_style, risk_style, created_at, updated_at
         FROM trader_profiles
        WHERE user_id = $1
        LIMIT 1`,
      [userId],
    );
    return result.rows[0] || null;
  }

  async findBySlug(slug) {
    const result = await this.db.query(
      `SELECT id, user_id, display_name, slug, bio, avatar_url, status, visibility,
              follower_count, win_rate, average_rr, profit_factor, sharpe_ratio,
              max_drawdown_percent, consistency_score, trading_style, risk_style,
              created_at, updated_at
         FROM trader_profiles
        WHERE slug = $1
        LIMIT 1`,
      [slug],
    );
    return result.rows[0] || null;
  }

  async list(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        conditions.push(`status = ANY($${index++}::text[])`);
        values.push(filters.status);
      } else {
        conditions.push(`status = $${index++}`);
        values.push(filters.status);
      }
    }

    if (filters.visibility) {
      conditions.push(`visibility = $${index++}`);
      values.push(filters.visibility);
    }

    if (filters.tradingStyle) {
      conditions.push(`trading_style = $${index++}`);
      values.push(filters.tradingStyle);
    }

    if (filters.riskStyle) {
      conditions.push(`risk_style = $${index++}`);
      values.push(filters.riskStyle);
    }

    if (filters.search) {
      conditions.push(
        `(display_name ILIKE $${index} OR slug ILIKE $${index} OR bio ILIKE $${index})`,
      );
      values.push(`%${filters.search}%`);
      index++;
    }

    if (filters.minFollowers !== undefined) {
      conditions.push(`follower_count >= $${index++}`);
      values.push(filters.minFollowers);
    }

    if (filters.minWinRate !== undefined) {
      conditions.push(`win_rate >= $${index++}`);
      values.push(filters.minWinRate);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM trader_profiles ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, user_id, display_name, slug, bio, avatar_url, status, visibility,
              follower_count, win_rate, average_rr, profit_factor, sharpe_ratio,
              max_drawdown_percent, consistency_score, reputation_score,
              trading_style, risk_style, created_at, updated_at
         FROM trader_profiles
         ${where}
        ORDER BY reputation_score DESC NULLS LAST, follower_count DESC, created_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { traders: result.rows, total, limit, offset };
  }

  async update(traderId, data) {
    const fields = [];
    const values = [traderId];
    let index = 2;

    const mapping = {
      displayName: 'display_name',
      slug: 'slug',
      bio: 'bio',
      avatarUrl: 'avatar_url',
      status: 'status',
      visibility: 'visibility',
      language: 'language',
      timezone: 'timezone',
      websiteUrl: 'website_url',
      followerCount: 'follower_count',
      totalTrades: 'total_trades',
      winningTrades: 'winning_trades',
      losingTrades: 'losing_trades',
      winRate: 'win_rate',
      averageRr: 'average_rr',
      profitFactor: 'profit_factor',
      sharpeRatio: 'sharpe_ratio',
      sortinoRatio: 'sortino_ratio',
      maxDrawdownPercent: 'max_drawdown_percent',
      consistencyScore: 'consistency_score',
      behaviorScore: 'behavior_score',
      reputationScore: 'reputation_score',
      tradingStyle: 'trading_style',
      riskStyle: 'risk_style',
      approvedAt: 'approved_at',
      suspendedAt: 'suspended_at',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.socialLinks !== undefined) {
      fields.push(`social_links = $${index++}`);
      values.push(data.socialLinks ? JSON.stringify(data.socialLinks) : null);
    }
    if (data.tags !== undefined) {
      fields.push(`tags = $${index++}`);
      values.push(data.tags);
    }
    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return this.findById(traderId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE trader_profiles SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findById(traderId);
  }

  async delete(traderId) {
    await this.db.query('DELETE FROM trader_profiles WHERE id = $1', [traderId]);
  }

  async incrementFollowerCount(traderId) {
    await this.db.query(
      `UPDATE trader_profiles
          SET follower_count = follower_count + 1,
              updated_at = NOW()
        WHERE id = $1`,
      [traderId],
    );
  }

  async decrementFollowerCount(traderId) {
    await this.db.query(
      `UPDATE trader_profiles
          SET follower_count = GREATEST(0, follower_count - 1),
              updated_at = NOW()
        WHERE id = $1`,
      [traderId],
    );
  }

  async createFollower(data) {
    const result = await this.db.query(
      `INSERT INTO trader_followers (
         trader_id, follower_id, status, copy_mode, fixed_lot, percentage,
         lot_multiplier, max_lot_size, min_lot_size, max_daily_trades,
         copy_stop_loss, copy_take_profit, copy_partial_close, copy_trailing_stop,
         broker_account_id, metadata, joined_at, left_at, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
         NOW(), $17, NOW(), NOW()
       )
       ON CONFLICT (trader_id, follower_id) DO NOTHING
       RETURNING id, trader_id, follower_id, status, copy_mode, joined_at, created_at`,
      [
        data.traderId,
        data.followerId,
        data.status || 'ACTIVE',
        data.copyMode || 'PROPORTIONAL',
        data.fixedLot ?? null,
        data.percentage ?? null,
        data.lotMultiplier ?? 1.0,
        data.maxLotSize ?? 100,
        data.minLotSize ?? 0.01,
        data.maxDailyTrades ?? 50,
        data.copyStopLoss !== false,
        data.copyTakeProfit !== false,
        data.copyPartialClose !== false,
        data.copyTrailingStop !== false,
        data.brokerAccountId || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
        data.leftAt || null,
      ],
    );
    return result.rows[0] || null;
  }

  async findFollower(traderId, followerId) {
    const result = await this.db.query(
      `SELECT id, trader_id, follower_id, status, copy_mode, fixed_lot, percentage,
              lot_multiplier, max_lot_size, min_lot_size, max_daily_trades,
              copy_stop_loss, copy_take_profit, copy_partial_close, copy_trailing_stop,
              broker_account_id, metadata, joined_at, left_at, created_at, updated_at
         FROM trader_followers
        WHERE trader_id = $1 AND follower_id = $2
        LIMIT 1`,
      [traderId, followerId],
    );
    return result.rows[0] || null;
  }

  async findFollowerById(followerId) {
    const result = await this.db.query(
      `SELECT id, trader_id, follower_id, status, copy_mode, fixed_lot, percentage,
              lot_multiplier, max_lot_size, min_lot_size, max_daily_trades,
              copy_stop_loss, copy_take_profit, copy_partial_close, copy_trailing_stop,
              broker_account_id, metadata, joined_at, left_at, created_at, updated_at
         FROM trader_followers
        WHERE id = $1
        LIMIT 1`,
      [followerId],
    );
    return result.rows[0] || null;
  }

  async listFollowers(traderId, filters = {}, pagination = {}) {
    const conditions = ['trader_id = $1'];
    const values = [traderId];
    let index = 2;

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM trader_followers ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, trader_id, follower_id, status, copy_mode, fixed_lot, percentage,
              lot_multiplier, max_lot_size, min_lot_size, max_daily_trades,
              copy_stop_loss, copy_take_profit, copy_partial_close, copy_trailing_stop,
              broker_account_id, joined_at, left_at, created_at
         FROM trader_followers
         ${where}
        ORDER BY joined_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { followers: result.rows, total, limit, offset };
  }

  async listFollowersByUser(followerId, filters = {}, pagination = {}) {
    const conditions = ['follower_id = $1'];
    const values = [followerId];
    let index = 2;

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const result = await this.db.query(
      `SELECT id, trader_id, follower_id, status, copy_mode, fixed_lot, percentage,
              lot_multiplier, max_lot_size, min_lot_size, max_daily_trades,
              broker_account_id, joined_at, left_at, created_at
         FROM trader_followers
         ${where}
        ORDER BY joined_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { followers: result.rows, limit, offset };
  }

  async updateFollower(followerId, data) {
    const fields = [];
    const values = [followerId];
    let index = 2;

    const mapping = {
      status: 'status',
      copyMode: 'copy_mode',
      fixedLot: 'fixed_lot',
      percentage: 'percentage',
      lotMultiplier: 'lot_multiplier',
      maxLotSize: 'max_lot_size',
      minLotSize: 'min_lot_size',
      maxDailyTrades: 'max_daily_trades',
      copyStopLoss: 'copy_stop_loss',
      copyTakeProfit: 'copy_take_profit',
      copyPartialClose: 'copy_partial_close',
      copyTrailingStop: 'copy_trailing_stop',
      brokerAccountId: 'broker_account_id',
      leftAt: 'left_at',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return this.findFollowerById(followerId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE trader_followers SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findFollowerById(followerId);
  }

  async deleteFollower(followerId) {
    await this.db.query('DELETE FROM trader_followers WHERE id = $1', [followerId]);
  }

  async countByStatus() {
    const result = await this.db.query(
      `SELECT status, COUNT(*)::int AS count
         FROM trader_profiles
        GROUP BY status`,
    );
    return result.rows;
  }

  async countByTradingStyle() {
    const result = await this.db.query(
      `SELECT trading_style, COUNT(*)::int AS count
         FROM trader_profiles
        WHERE trading_style IS NOT NULL
        GROUP BY trading_style
        ORDER BY count DESC`,
    );
    return result.rows;
  }

  async getLeaderboard(metric, period, limit = 100) {
    const orderColumn = {
      PROFIT: 'profit_factor',
      WIN_RATE: 'win_rate',
      PROFIT_FACTOR: 'profit_factor',
      SHARPE_RATIO: 'sharpe_ratio',
      AVERAGE_RR: 'average_rr',
      CONSISTENCY: 'consistency_score',
    }[metric] || 'reputation_score';

    const result = await this.db.query(
      `SELECT id, user_id, display_name, slug, avatar_url, follower_count,
              win_rate, average_rr, profit_factor, sharpe_ratio, max_drawdown_percent,
              consistency_score, reputation_score, trading_style, risk_style
         FROM trader_profiles
        WHERE status IN ('APPROVED', 'ACTIVE')
          AND visibility = 'PUBLIC'
          AND ${orderColumn} IS NOT NULL
        ORDER BY ${orderColumn} DESC NULLS LAST, follower_count DESC
        LIMIT $1`,
      [limit],
    );
    return result.rows;
  }
}

export default TraderRepository;