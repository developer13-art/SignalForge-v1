/**
 * Copy Trading Repository
 *
 * @module signalforge/server/modules/copy-trading/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class CopyTradingRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createSubscription(data) {
    const result = await this.db.query(
      `INSERT INTO copy_trading_subscriptions (
         subscriber_id, provider_id, broker_account_id, status, scaling_mode,
         fixed_lot, percentage, max_lot_size, min_lot_size, lot_multiplier,
         risk_profile_id, allowed_symbols, blocked_symbols, max_daily_loss,
         max_open_trades, copy_stop_loss, copy_take_profit, copy_partial_close,
         copy_trailing_stop, latency_alert_ms, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
         $17, $18, $19, $20, NOW(), NOW()
       )
       RETURNING id, subscriber_id, provider_id, broker_account_id, status,
                 scaling_mode, created_at`,
      [
        data.subscriberId,
        data.providerId,
        data.brokerAccountId,
        data.status || 'ACTIVE',
        data.scalingMode || 'PERCENTAGE',
        data.fixedLot ?? null,
        data.percentage ?? null,
        data.maxLotSize ?? 100,
        data.minLotSize ?? 0.01,
        data.lotMultiplier ?? 1.0,
        data.riskProfileId || null,
        data.allowedSymbols || [],
        data.blockedSymbols || [],
        data.maxDailyLoss ?? null,
        data.maxOpenTrades ?? null,
        data.copyStopLoss !== false,
        data.copyTakeProfit !== false,
        data.copyPartialClose !== false,
        data.copyTrailingStop !== false,
        data.latencyAlertMs ?? 2000,
      ],
    );
    return result.rows[0];
  }

  async findSubscriptionById(subscriptionId) {
    const result = await this.db.query(
      `SELECT id, subscriber_id, provider_id, broker_account_id, status,
              scaling_mode, fixed_lot, percentage, max_lot_size, min_lot_size,
              lot_multiplier, risk_profile_id, allowed_symbols, blocked_symbols,
              max_daily_loss, max_open_trades, copy_stop_loss, copy_take_profit,
              copy_partial_close, copy_trailing_stop, latency_alert_ms,
              last_copied_at, created_at, updated_at
         FROM copy_trading_subscriptions
        WHERE id = $1
        LIMIT 1`,
      [subscriptionId],
    );
    return result.rows[0] || null;
  }

  async findSubscriptionBySubscriberAndProvider(subscriberId, providerId) {
    const result = await this.db.query(
      `SELECT id, subscriber_id, provider_id, broker_account_id, status,
              scaling_mode, fixed_lot, percentage, max_lot_size, min_lot_size,
              lot_multiplier, risk_profile_id, allowed_symbols, blocked_symbols,
              created_at, updated_at
         FROM copy_trading_subscriptions
        WHERE subscriber_id = $1 AND provider_id = $2
        LIMIT 1`,
      [subscriberId, providerId],
    );
    return result.rows[0] || null;
  }

  async listSubscriptionsBySubscriber(subscriberId, filters = {}) {
    const conditions = ['subscriber_id = $1'];
    const values = [subscriberId];
    let index = 2;

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    if (filters.providerId) {
      conditions.push(`provider_id = $${index++}`);
      values.push(filters.providerId);
    }

    const result = await this.db.query(
      `SELECT id, subscriber_id, provider_id, broker_account_id, status,
              scaling_mode, fixed_lot, percentage, max_lot_size, min_lot_size,
              last_copied_at, created_at, updated_at
         FROM copy_trading_subscriptions
         WHERE ${conditions.join(' AND ')}
        ORDER BY created_at DESC`,
      values,
    );
    return result.rows;
  }

  async listActiveSubscribersByProvider(providerId) {
    const result = await this.db.query(
      `SELECT id, subscriber_id, provider_id, broker_account_id, status,
              scaling_mode, fixed_lot, percentage, max_lot_size, min_lot_size,
              lot_multiplier, risk_profile_id, allowed_symbols, blocked_symbols,
              copy_stop_loss, copy_take_profit, copy_partial_close,
              copy_trailing_stop, latency_alert_ms
         FROM copy_trading_subscriptions
        WHERE provider_id = $1
          AND status = 'ACTIVE'
        ORDER BY created_at ASC`,
      [providerId],
    );
    return result.rows;
  }

  async countSubscribersByProvider(providerId) {
    const result = await this.db.query(
      `SELECT COUNT(*)::int AS count
         FROM copy_trading_subscriptions
        WHERE provider_id = $1
          AND status = 'ACTIVE'`,
      [providerId],
    );
    return result.rows[0]?.count || 0;
  }

  async updateSubscription(subscriptionId, data) {
    const fields = [];
    const values = [subscriptionId];
    let index = 2;

    const mapping = {
      status: 'status',
      scalingMode: 'scaling_mode',
      fixedLot: 'fixed_lot',
      percentage: 'percentage',
      maxLotSize: 'max_lot_size',
      minLotSize: 'min_lot_size',
      lotMultiplier: 'lot_multiplier',
      riskProfileId: 'risk_profile_id',
      allowedSymbols: 'allowed_symbols',
      blockedSymbols: 'blocked_symbols',
      maxDailyLoss: 'max_daily_loss',
      maxOpenTrades: 'max_open_trades',
      copyStopLoss: 'copy_stop_loss',
      copyTakeProfit: 'copy_take_profit',
      copyPartialClose: 'copy_partial_close',
      copyTrailingStop: 'copy_trailing_stop',
      latencyAlertMs: 'latency_alert_ms',
      lastCopiedAt: 'last_copied_at',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return this.findSubscriptionById(subscriptionId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE copy_trading_subscriptions SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );

    return this.findSubscriptionById(subscriptionId);
  }

  async deleteSubscription(subscriptionId) {
    await this.db.query(
      'DELETE FROM copy_trading_subscriptions WHERE id = $1',
      [subscriptionId],
    );
  }

  async createFanOutBatch(data) {
    const result = await this.db.query(
      `INSERT INTO copy_trading_fanout_batches (
         signal_id, provider_id, batch_index, total_batches, subscriber_count,
         status, started_at, completed_at, error, metadata, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING id, signal_id, provider_id, batch_index, total_batches,
                 subscriber_count, status, created_at`,
      [
        data.signalId,
        data.providerId,
        data.batchIndex,
        data.totalBatches,
        data.subscriberCount,
        data.status || 'PENDING',
        data.startedAt || null,
        data.completedAt || null,
        data.error || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async updateFanOutBatch(batchId, data) {
    const fields = [];
    const values = [batchId];
    let index = 2;

    const mapping = {
      status: 'status',
      startedAt: 'started_at',
      completedAt: 'completed_at',
      error: 'error',
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
      return;
    }

    await this.db.query(
      `UPDATE copy_trading_fanout_batches SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
  }

  async listFanOutBatchesBySignal(signalId) {
    const result = await this.db.query(
      `SELECT id, signal_id, provider_id, batch_index, total_batches,
              subscriber_count, status, started_at, completed_at, error, created_at
         FROM copy_trading_fanout_batches
        WHERE signal_id = $1
        ORDER BY batch_index ASC`,
      [signalId],
    );
    return result.rows;
  }

  async createFanOutRecord(data) {
    const result = await this.db.query(
      `INSERT INTO copy_trading_fanout_records (
         batch_id, signal_id, provider_id, subscriber_id, subscription_id,
         trade_id, personalized_volume, status, error, duration_ms, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING id, subscriber_id, trade_id, status, created_at`,
      [
        data.batchId || null,
        data.signalId,
        data.providerId,
        data.subscriberId,
        data.subscriptionId,
        data.tradeId || null,
        data.personalizedVolume ?? null,
        data.status,
        data.error || null,
        data.durationMs ?? null,
      ],
    );
    return result.rows[0];
  }

  async listFanOutRecordsByBatch(batchId) {
    const result = await this.db.query(
      `SELECT id, batch_id, signal_id, subscriber_id, subscription_id,
              trade_id, personalized_volume, status, error, duration_ms, created_at
         FROM copy_trading_fanout_records
        WHERE batch_id = $1
        ORDER BY created_at ASC`,
      [batchId],
    );
    return result.rows;
  }

  async countFanOutRecordsByStatus(signalId) {
    const result = await this.db.query(
      `SELECT status, COUNT(*)::int AS count
         FROM copy_trading_fanout_records
        WHERE signal_id = $1
        GROUP BY status`,
      [signalId],
    );
    return result.rows;
  }
}

export default CopyTradingRepository;