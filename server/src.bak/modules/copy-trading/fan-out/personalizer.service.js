/**
 * Personalizer Service
 *
 * @module signalforge/server/modules/copy-trading/fan-out/personalizer
 */

import { LotScalingService } from '../scaling/lot-scaling.service.js';
import { CopyTradingRepository } from '../copy-trading.repository.js';
import {
  emitPersonalizedTradeCreated,
  emitPersonalizationFailed,
  emitCopyFailed,
} from '../copy-trading.events.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class PersonalizerService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new CopyTradingRepository();
    this.scaling = dependencies.scaling || new LotScalingService();
    this.logger = getLogger('copy-trading-personalizer');
  }

  buildPersonalizedSignal(masterSignal, subscription, accountSnapshot = null, options = {}) {
    const scalingResult = this.scaling.calculate(
      subscription,
      { volume: masterSignal.volume },
      accountSnapshot,
      options,
    );

    return {
      masterSignalId: masterSignal.signalId,
      providerId: masterSignal.providerId,
      subscriptionId: subscription.id,
      subscriberId: subscription.subscriber_id,
      brokerAccountId: subscription.broker_account_id,
      symbol: masterSignal.symbol,
      normalizedSymbol: masterSignal.normalizedSymbol,
      direction: masterSignal.direction,
      entryType: masterSignal.entryType,
      entryPrice: masterSignal.entryPrice ?? null,
      stopLoss: subscription.copy_stop_loss !== false ? masterSignal.stopLoss : null,
      takeProfit: subscription.copy_take_profit !== false ? masterSignal.takeProfit : null,
      volume: scalingResult.volume,
      scaling: scalingResult,
      metadata: {
        originalProviderVolume: masterSignal.volume,
        copyStopLoss: subscription.copy_stop_loss !== false,
        copyTakeProfit: subscription.copy_take_profit !== false,
        copyPartialClose: subscription.copy_partial_close !== false,
        copyTrailingStop: subscription.copy_trailing_stop !== false,
      },
    };
  }

  async personalize(masterSignal, subscriptions, options = {}) {
    const personalized = [];
    const failed = [];

    for (const subscription of subscriptions) {
      try {
        const accountSnapshot = options.getAccountSnapshot
          ? await options.getAccountSnapshot(subscription.broker_account_id)
          : null;

        const signal = this.buildPersonalizedSignal(
          masterSignal,
          subscription,
          accountSnapshot,
          options,
        );

        personalized.push({
          subscriptionId: subscription.id,
          subscriberId: subscription.subscriber_id,
          brokerAccountId: subscription.broker_account_id,
          signal,
        });
      } catch (error) {
        this.logger.error(
          { err: error, subscriberId: subscription.subscriber_id },
          'Personalization failed',
        );
        failed.push({
          subscriptionId: subscription.id,
          subscriberId: subscription.subscriber_id,
          error: error.message,
        });
        await emitPersonalizationFailed(subscription.subscriber_id, error);
      }
    }

    return { personalized, failed };
  }

  async recordSuccess(subscriberId, tradeId) {
    await emitPersonalizedTradeCreated(subscriberId, tradeId);
  }

  async recordCopyFailure(subscriberId, reason) {
    await emitCopyFailed(subscriberId, reason);
  }
}

export default PersonalizerService;