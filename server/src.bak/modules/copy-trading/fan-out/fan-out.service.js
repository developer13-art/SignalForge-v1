/**
 * Fan-Out Service
 *
 * @module signalforge/server/modules/copy-trading/fan-out/service
 */

import { CopyTradingRepository } from '../copy-trading.repository.js';
import { SubscriberResolverService } from './subscriber-resolver.service.js';
import { PersonalizerService } from './personalizer.service.js';
import { BatchService } from './batch.service.js';
import { BatchSchedulerService } from './batch-scheduler.service.js';
import { FanOutMetricsService } from './fan-out-metrics.service.js';
import { DEFAULT_BATCH_SIZE, DEFAULT_LATENCY_ALERT_MS } from '../copy-trading.constants.js';
import {
  emitFanOutStarted,
  emitFanOutBatchCreated,
  emitFanOutBatchCompleted,
  emitFanOutCompleted,
  emitFanOutFailed,
  emitLatencyAlert,
} from '../copy-trading.events.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class FanOutService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new CopyTradingRepository();
    this.resolver = dependencies.resolver || new SubscriberResolverService(this.repository);
    this.personalizer = dependencies.personalizer || new PersonalizerService({
      repository: this.repository,
    });
    this.batches = dependencies.batches || new BatchService(DEFAULT_BATCH_SIZE);
    this.scheduler = dependencies.scheduler || new BatchSchedulerService();
    this.metrics = dependencies.metrics || new FanOutMetricsService();
    this.tradeCreator = dependencies.tradeCreator || null;
    this.logger = getLogger('copy-trading-fanout');
  }

  async fanOut(masterSignal, options = {}) {
    const startedAt = Date.now();
    const providerId = masterSignal.providerId;

    const subscribers = await this.resolver.resolveSubscribers(providerId, masterSignal, {
      excludedSubscriberIds: options.excludedSubscriberIds,
    });

    await emitFanOutStarted(
      masterSignal.signalId,
      providerId,
      subscribers.length,
    );

    if (subscribers.length === 0) {
      await emitFanOutCompleted(masterSignal.signalId, providerId, {
        subscriberCount: 0,
        succeeded: 0,
        failed: 0,
      });
      return { subscriberCount: 0, succeeded: 0, failed: 0, durationMs: Date.now() - startedAt };
    }

    const batchList = this.batches.buildBatches(subscribers, options.batchSize);

    const personalized = await this.personalizer.personalize(masterSignal, subscribers, {
      getAccountSnapshot: options.getAccountSnapshot,
    });

    const successful = personalized.personalized;
    const failedPersonalization = personalized.failed;

    let succeeded = 0;
    let failed = failedPersonalization.length;

    const tasks = batchList.map((batch, index) => ({
      batchIndex: index,
      totalBatches: batchList.length,
      subscribers: batch.subscribers.filter((s) =>
        successful.some((p) => p.subscriptionId === s.id),
      ),
    }));

    for (const task of tasks) {
      const batchRecord = await this.repository.createFanOutBatch({
        signalId: masterSignal.signalId,
        providerId,
        batchIndex: task.batchIndex,
        totalBatches: task.totalBatches,
        subscriberCount: task.subscribers.length,
        status: 'PENDING',
      });

      await emitFanOutBatchCreated(
        batchRecord.id,
        masterSignal.signalId,
        task.batchIndex,
        task.totalBatches,
      );

      await this.repository.updateFanOutBatch(batchRecord.id, {
        status: 'PROCESSING',
        startedAt: new Date(),
      });

      const batchResult = await this.scheduler.schedule(task.subscribers, async (subscriber) => {
        return this.processSubscriber(masterSignal, subscriber, successful, options);
      });

      const batchSucceeded = batchResult.results.filter((r) => r.success).length;
      const batchFailed = batchResult.results.length - batchSucceeded;

      succeeded += batchSucceeded;
      failed += batchFailed;

      await this.repository.updateFanOutBatch(batchRecord.id, {
        status: batchFailed === 0 ? 'COMPLETED' : 'PARTIAL',
        completedAt: new Date(),
      });

      await emitFanOutBatchCompleted(batchRecord.id, masterSignal.signalId, {
        succeeded: batchSucceeded,
        failed: batchFailed,
      });
    }

    const durationMs = Date.now() - startedAt;
    this.metrics.recordDuration(durationMs);

    if (durationMs > DEFAULT_LATENCY_ALERT_MS * 5) {
      await emitLatencyAlert(null, durationMs, DEFAULT_LATENCY_ALERT_MS * 5, {
        signalId: masterSignal.signalId,
      });
    }

    await emitFanOutCompleted(masterSignal.signalId, providerId, {
      subscriberCount: subscribers.length,
      succeeded,
      failed,
      durationMs,
    });

    return {
      subscriberCount: subscribers.length,
      succeeded,
      failed,
      durationMs,
      batches: batchList.length,
    };
  }

  async processSubscriber(masterSignal, subscriber, personalizedList, options) {
    const personalized = personalizedList.find((p) => p.subscriptionId === subscriber.id);
    if (!personalized) {
      throw new Error('Personalized signal not found');
    }

    if (!this.tradeCreator) {
      await this.repository.createFanOutRecord({
        signalId: masterSignal.signalId,
        providerId: masterSignal.providerId,
        subscriberId: subscriber.subscriber_id,
        subscriptionId: subscriber.id,
        tradeId: null,
        personalizedVolume: personalized.signal.volume,
        status: 'SKIPPED',
      });
      return { skipped: true };
    }

    try {
      const created = await this.tradeCreator({
        masterSignal,
        subscription: subscriber,
        personalized: personalized.signal,
      });

      await this.repository.createFanOutRecord({
        signalId: masterSignal.signalId,
        providerId: masterSignal.providerId,
        subscriberId: subscriber.subscriber_id,
        subscriptionId: subscriber.id,
        tradeId: created?.id || created?.tradeId || null,
        personalizedVolume: personalized.signal.volume,
        status: 'SUCCEEDED',
      });

      await this.personalizer.recordSuccess(subscriber.subscriber_id, created?.tradeId || null);

      return { created };
    } catch (error) {
      await this.repository.createFanOutRecord({
        signalId: masterSignal.signalId,
        providerId: masterSignal.providerId,
        subscriberId: subscriber.subscriber_id,
        subscriptionId: subscriber.id,
        personalizedVolume: personalized.signal.volume,
        status: 'FAILED',
        error: error.message,
      });

      await this.personalizer.recordCopyFailure(subscriber.subscriber_id, error.message);

      throw error;
    }
  }

  getMetrics() {
    return this.metrics.summarize();
  }

  async listBatches(signalId) {
    return this.repository.listFanOutBatchesBySignal(signalId);
  }

  async listRecords(batchId) {
    return this.repository.listFanOutRecordsByBatch(batchId);
  }

  async countByStatus(signalId) {
    return this.repository.countFanOutRecordsByStatus(signalId);
  }
}

export default FanOutService;