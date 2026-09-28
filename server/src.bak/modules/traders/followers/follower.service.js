/**
 * Follower Service
 *
 * @module signalforge/server/modules/traders/followers/service
 */

import { FollowerRepository } from './repository.js';
import { TraderRepository } from '../trader.repository.js';
import {
  TRADER_STATUSES,
  FOLLOWER_STATUSES,
} from '../trader.constants.js';
import {
  TraderNotFoundError,
  FollowerNotFoundError,
  FollowerAlreadyExistsError,
  CannotFollowSelfError,
  TraderNotActiveError,
} from '../trader.errors.js';
import {
  emitFollowerAdded,
  emitFollowerRemoved,
} from '../trader.events.js';

export class FollowerService {
  constructor(repository = null, traderRepository = null) {
    this.repository = repository || new FollowerRepository();
    this.traderRepository = traderRepository || new TraderRepository();
  }

  async follow(traderId, followerUserId, options = {}) {
    const trader = await this.traderRepository.findById(traderId);
    if (!trader) {
      throw new TraderNotFoundError();
    }

    if (trader.user_id === followerUserId) {
      throw new CannotFollowSelfError();
    }

    if (
      ![
        TRADER_STATUSES.APPROVED,
        TRADER_STATUSES.ACTIVE,
      ].includes(trader.status)
    ) {
      throw new TraderNotActiveError(undefined, { status: trader.status });
    }

    const existing = await this.repository.find(traderId, followerUserId);
    if (existing && existing.status === FOLLOWER_STATUSES.ACTIVE) {
      throw new FollowerAlreadyExistsError();
    }

    const created =
      existing ||
      (await this.repository.create({
        traderId,
        followerId: followerUserId,
        status: FOLLOWER_STATUSES.ACTIVE,
        copyMode: options.copyMode || 'PROPORTIONAL',
        fixedLot: options.fixedLot ?? null,
        percentage: options.percentage ?? null,
        lotMultiplier: options.lotMultiplier ?? 1.0,
        maxLotSize: options.maxLotSize ?? 100,
        minLotSize: options.minLotSize ?? 0.01,
        maxDailyTrades: options.maxDailyTrades ?? 50,
        copyStopLoss: options.copyStopLoss !== false,
        copyTakeProfit: options.copyTakeProfit !== false,
        copyPartialClose: options.copyPartialClose !== false,
        copyTrailingStop: options.copyTrailingStop !== false,
        brokerAccountId: options.brokerAccountId || null,
        metadata: options.metadata || null,
      }));

    if (!created) {
      const found = await this.repository.find(traderId, followerUserId);
      throw new FollowerAlreadyExistsError(undefined, { followerRecordId: found?.id });
    }

    await this.repository.incrementTraderCount(traderId);
    await emitFollowerAdded(traderId, followerUserId, created.id);

    return this.serialize(created);
  }

  async unfollow(traderId, followerUserId) {
    const follower = await this.repository.find(traderId, followerUserId);
    if (!follower || follower.status !== FOLLOWER_STATUSES.ACTIVE) {
      throw new FollowerNotFoundError();
    }

    await this.repository.update(follower.id, {
      status: FOLLOWER_STATUSES.STOPPED,
      leftAt: new Date(),
    });
    await this.repository.decrementTraderCount(traderId);
    await emitFollowerRemoved(traderId, followerUserId);

    return { unfollowed: true };
  }

  async pause(traderId, followerUserId) {
    const follower = await this.repository.find(traderId, followerUserId);
    if (!follower) {
      throw new FollowerNotFoundError();
    }
    await this.repository.update(follower.id, { status: FOLLOWER_STATUSES.PAUSED });
    const updated = await this.repository.findById(follower.id);
    return this.serialize(updated);
  }

  async resume(traderId, followerUserId) {
    const follower = await this.repository.find(traderId, followerUserId);
    if (!follower) {
      throw new FollowerNotFoundError();
    }
    await this.repository.update(follower.id, { status: FOLLOWER_STATUSES.ACTIVE });
    const updated = await this.repository.findById(follower.id);
    return this.serialize(updated);
  }

  async listFollowers(traderId, filters = {}, pagination = {}) {
    const result = await this.repository.listByTrader(traderId, filters, pagination);
    return {
      followers: result.followers.map((f) => this.serialize(f)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async listFollowing(followerUserId, filters = {}, pagination = {}) {
    const result = await this.repository.listByUser(followerUserId, filters, pagination);
    return {
      following: result.followers.map((f) => this.serialize(f)),
      limit: result.limit,
      offset: result.offset,
    };
  }

  async updateCopySettings(traderId, followerUserId, payload) {
    const follower = await this.repository.find(traderId, followerUserId);
    if (!follower) {
      throw new FollowerNotFoundError();
    }
    await this.repository.update(follower.id, payload);
    const updated = await this.repository.findById(follower.id);
    return this.serialize(updated);
  }

  async getCopySettings(traderId, followerUserId) {
    const follower = await this.repository.find(traderId, followerUserId);
    if (!follower) {
      throw new FollowerNotFoundError();
    }
    return this.serialize(follower);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      traderId: row.trader_id,
      followerId: row.follower_id,
      status: row.status,
      copyMode: row.copy_mode,
      fixedLot: row.fixed_lot,
      percentage: row.percentage,
      lotMultiplier: row.lot_multiplier,
      maxLotSize: row.max_lot_size,
      minLotSize: row.min_lot_size,
      maxDailyTrades: row.max_daily_trades,
      copyStopLoss: row.copy_stop_loss,
      copyTakeProfit: row.copy_take_profit,
      copyPartialClose: row.copy_partial_close,
      copyTrailingStop: row.copy_trailing_stop,
      brokerAccountId: row.broker_account_id,
      metadata: this.parseJson(row.metadata),
      joinedAt: row.joined_at,
      leftAt: row.left_at,
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

export default FollowerService;