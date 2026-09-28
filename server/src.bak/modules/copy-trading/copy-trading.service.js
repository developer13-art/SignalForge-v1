/**
 * Copy Trading Service (facade)
 *
 * @module signalforge/server/modules/copy-trading/service
 */

import { CopyTradingRepository } from './copy-trading.repository.js';
import { FanOutService } from './fan-out/fan-out.service.js';
import { SubscriberResolverService } from './fan-out/subscriber-resolver.service.js';
import { PersonalizerService } from './fan-out/personalizer.service.js';
import { LotScalingService } from './scaling/lot-scaling.service.js';
import { ProviderStopSyncService } from './sync/provider-stop-sync.service.js';
import { PartialCopyService } from './sync/partial-copy.service.js';
import { LatencyMonitorService } from './sync/latency-monitor.service.js';
import { SubscriberReconciliationService } from './sync/subscriber-reconciliation.service.js';
import { MAX_SUBSCRIBERS_PER_PROVIDER } from './copy-trading.constants.js';
import {
  SubscriptionNotFoundError,
  SubscriptionAlreadyExistsError,
  SubscriberLimitExceededError,
} from './copy-trading.errors.js';
import {
  emitSubscribed,
  emitUnsubscribed,
  emitSubscriptionUpdated,
  emitSubscriptionPaused,
  emitSubscriptionResumed,
} from './copy-trading.events.js';

export class CopyTradingService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new CopyTradingRepository();
    this.scaling = dependencies.scaling || new LotScalingService();
    this.resolver = dependencies.resolver || new SubscriberResolverService(this.repository);
    this.personalizer = dependencies.personalizer || new PersonalizerService({
      repository: this.repository,
      scaling: this.scaling,
    });

    this.fanOut = dependencies.fanOut || new FanOutService({
      repository: this.repository,
      resolver: this.resolver,
      personalizer: this.personalizer,
      tradeCreator: dependencies.tradeCreator || null,
    });

    this.providerStopSync = dependencies.providerStopSync || new ProviderStopSyncService({
      copyRepository: this.repository,
      closePosition: dependencies.closePosition || null,
    });
    this.partialCopy = dependencies.partialCopy || new PartialCopyService();
    this.latencyMonitor = dependencies.latencyMonitor || new LatencyMonitorService();
    this.reconciliation = dependencies.reconciliation || new SubscriberReconciliationService({
      copyRepository: this.repository,
    });
  }

  async subscribe(subscriberId, payload) {
    const existing = await this.repository.findSubscriptionBySubscriberAndProvider(
      subscriberId,
      payload.providerId,
    );
    if (existing) {
      throw new SubscriptionAlreadyExistsError();
    }

    const count = await this.repository.countSubscribersByProvider(payload.providerId);
    if (count >= MAX_SUBSCRIBERS_PER_PROVIDER) {
      throw new SubscriberLimitExceededError();
    }

    const created = await this.repository.createSubscription({
      subscriberId,
      providerId: payload.providerId,
      brokerAccountId: payload.brokerAccountId,
      scalingMode: payload.scalingMode || 'PERCENTAGE',
      fixedLot: payload.fixedLot ?? null,
      percentage: payload.percentage ?? 100,
      maxLotSize: payload.maxLotSize ?? 100,
      minLotSize: payload.minLotSize ?? 0.01,
      lotMultiplier: payload.lotMultiplier ?? 1.0,
      riskProfileId: payload.riskProfileId || null,
      allowedSymbols: payload.allowedSymbols || [],
      blockedSymbols: payload.blockedSymbols || [],
      maxDailyLoss: payload.maxDailyLoss ?? null,
      maxOpenTrades: payload.maxOpenTrades ?? null,
      copyStopLoss: payload.copyStopLoss !== false,
      copyTakeProfit: payload.copyTakeProfit !== false,
      copyPartialClose: payload.copyPartialClose !== false,
      copyTrailingStop: payload.copyTrailingStop !== false,
      latencyAlertMs: payload.latencyAlertMs ?? 2000,
    });

    await emitSubscribed(subscriberId, payload.providerId, created.id);

    return this.getSubscriptionById(created.id);
  }

  async getSubscriptionById(subscriptionId) {
    const row = await this.repository.findSubscriptionById(subscriptionId);
    if (!row) {
      throw new SubscriptionNotFoundError();
    }
    return this.serialize(row);
  }

  async listSubscriptions(subscriberId, filters) {
    const rows = await this.repository.listSubscriptionsBySubscriber(subscriberId, filters);
    return rows.map((r) => this.serialize(r));
  }

  async updateSubscription(subscriptionId, payload) {
    const existing = await this.repository.findSubscriptionById(subscriptionId);
    if (!existing) {
      throw new SubscriptionNotFoundError();
    }
    await this.repository.updateSubscription(subscriptionId, payload);
    const updated = await this.repository.findSubscriptionById(subscriptionId);
    await emitSubscriptionUpdated(subscriptionId, Object.keys(payload));
    return this.serialize(updated);
  }

  async unsubscribe(subscriptionId, subscriberId) {
    const existing = await this.repository.findSubscriptionById(subscriptionId);
    if (!existing || existing.subscriber_id !== subscriberId) {
      throw new SubscriptionNotFoundError();
    }
    await this.repository.deleteSubscription(subscriptionId);
    await emitUnsubscribed(subscriberId, existing.provider_id, subscriptionId);
    return { unsubscribed: true };
  }

  async pauseSubscription(subscriptionId) {
    const existing = await this.repository.findSubscriptionById(subscriptionId);
    if (!existing) {
      throw new SubscriptionNotFoundError();
    }
    await this.repository.updateSubscription(subscriptionId, { status: 'PAUSED' });
    await emitSubscriptionPaused(subscriptionId);
    const updated = await this.repository.findSubscriptionById(subscriptionId);
    return this.serialize(updated);
  }

  async resumeSubscription(subscriptionId) {
    const existing = await this.repository.findSubscriptionById(subscriptionId);
    if (!existing) {
      throw new SubscriptionNotFoundError();
    }
    await this.repository.updateSubscription(subscriptionId, { status: 'ACTIVE' });
    await emitSubscriptionResumed(subscriptionId);
    const updated = await this.repository.findSubscriptionById(subscriptionId);
    return this.serialize(updated);
  }

  async fanOutSignal(masterSignal, options = {}) {
    return this.fanOut.fanOut(masterSignal, options);
  }

  async getFanOutMetrics() {
    return this.fanOut.getMetrics();
  }

  async listFanOutBatches(signalId) {
    return this.fanOut.listBatches(signalId);
  }

  async listFanOutRecords(batchId) {
    return this.fanOut.listRecords(batchId);
  }

  async countFanOutByStatus(signalId) {
    return this.fanOut.countByStatus(signalId);
  }

  async syncProviderClose(providerTradeId, reason) {
    return this.providerStopSync.syncProviderClose(providerTradeId, reason);
  }

  async applyPartialCopy(providerInstruction, userTrades, executor) {
    return this.partialCopy.applyToSubscribers(providerInstruction, userTrades, executor);
  }

  recordLatency(subscriberId, latencyMs, threshold) {
    return this.latencyMonitor.record(subscriberId, latencyMs, threshold);
  }

  getLatencySummary() {
    return this.latencyMonitor.summarize();
  }

  async reconcileSubscriber(subscriberId, providerId) {
    return this.reconciliation.reconcileSubscriber(subscriberId, providerId);
  }

  async reconcileAll() {
    return this.reconciliation.reconcileAll();
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      subscriberId: row.subscriber_id,
      providerId: row.provider_id,
      brokerAccountId: row.broker_account_id,
      status: row.status,
      scalingMode: row.scaling_mode,
      fixedLot: row.fixed_lot,
      percentage: row.percentage,
      maxLotSize: row.max_lot_size,
      minLotSize: row.min_lot_size,
      lotMultiplier: row.lot_multiplier,
      riskProfileId: row.risk_profile_id,
      allowedSymbols: row.allowed_symbols,
      blockedSymbols: row.blocked_symbols,
      maxDailyLoss: row.max_daily_loss,
      maxOpenTrades: row.max_open_trades,
      copyStopLoss: row.copy_stop_loss,
      copyTakeProfit: row.copy_take_profit,
      copyPartialClose: row.copy_partial_close,
      copyTrailingStop: row.copy_trailing_stop,
      latencyAlertMs: row.latency_alert_ms,
      lastCopiedAt: row.last_copied_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default CopyTradingService;