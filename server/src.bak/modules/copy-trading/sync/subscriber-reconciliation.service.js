/**
 * Subscriber Reconciliation Service
 *
 * @module signalforge/server/modules/copy-trading/sync/subscriber-reconciliation
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import { CopyTradingRepository } from '../copy-trading.repository.js';
import { TradeStateRepository } from '../../trade-state/trade-state.repository.js';
import { emitSubscriberReconciled, emitCopyFailed } from '../copy-trading.events.js';
import { SUBSCRIBER_RECONCILE_INTERVAL_MS } from '../copy-trading.constants.js';

export class SubscriberReconciliationService {
  constructor(dependencies = {}) {
    this.copyRepository = dependencies.copyRepository || new CopyTradingRepository();
    this.tradeRepository = dependencies.tradeRepository || new TradeStateRepository();
    this.reconcileHandler = dependencies.reconcileHandler || null;
    this.logger = getLogger('copy-trading-reconciliation');
    this.intervalHandle = null;
  }

  async reconcileSubscriber(subscriberId, providerId) {
    const subscriptions = await this.copyRepository.listSubscriptionsBySubscriber(subscriberId, {
      providerId,
      status: 'ACTIVE',
    });

    if (subscriptions.length === 0) {
      return { reconciled: false, reason: 'NO_SUBSCRIPTIONS' };
    }

    const summary = {
      subscriberId,
      providerId,
      subscriptionCount: subscriptions.length,
      checkedTrades: 0,
      discrepancies: 0,
    };

    for (const subscription of subscriptions) {
      const openTrades = await this.tradeRepository.listTrades(
        {
          userId: subscriberId,
          providerId,
          status: ['OPEN', 'BREAK_EVEN', 'TRAILING_STOP', 'PARTIAL_CLOSE'],
        },
        { limit: 100, offset: 0 },
      );

      summary.checkedTrades += openTrades.trades.length;

      if (this.reconcileHandler) {
        const discrepancies = await this.reconcileHandler(subscription, openTrades.trades);
        summary.discrepancies += discrepancies.length;
      }
    }

    await emitSubscriberReconciled(subscriberId, summary);

    return { reconciled: true, summary };
  }

  async reconcileAll() {
    try {
      const users = await this.tradeRepository.listTrades({}, { limit: 500, offset: 0 });
      const subscriberIds = new Set();
      for (const trade of users.trades) {
        if (trade.provider_id) {
          subscriberIds.add(trade.user_id);
        }
      }

      const results = [];
      for (const subscriberId of subscriberIds) {
        try {
          const result = await this.reconcileSubscriber(subscriberId, null);
          results.push(result);
        } catch (error) {
          this.logger.error({ err: error, subscriberId }, 'Reconciliation failed');
          await emitCopyFailed(subscriberId, error.message);
        }
      }

      return { reconciled: results.length, results };
    } catch (error) {
      this.logger.error({ err: error }, 'Reconciliation cycle failed');
      return { reconciled: 0, error: error.message };
    }
  }

  start(intervalMs = SUBSCRIBER_RECONCILE_INTERVAL_MS) {
    if (this.intervalHandle) {
      return;
    }
    this.intervalHandle = setInterval(() => this.reconcileAll(), intervalMs);
    if (this.intervalHandle.unref) {
      this.intervalHandle.unref();
    }
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }
}

export default SubscriberReconciliationService;