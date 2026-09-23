/**
 * Provider Stop Sync Service
 *
 * @module signalforge/server/modules/copy-trading/sync/provider-stop-sync
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import { TradeStateRepository } from '../../trade-state/trade-state.repository.js';
import { CopyTradingRepository } from '../copy-trading.repository.js';
import { emitProviderStopSync, emitCopyFailed } from '../copy-trading.events.js';

export class ProviderStopSyncService {
  constructor(dependencies = {}) {
    this.tradeRepository = dependencies.tradeRepository || new TradeStateRepository();
    this.copyRepository = dependencies.copyRepository || new CopyTradingRepository();
    this.closePosition = dependencies.closePosition || null;
    this.logger = getLogger('copy-trading-stop-sync');
  }

  async syncProviderClose(providerTradeId, reason = 'PROVIDER_CLOSE') {
    const providerTrade = await this.tradeRepository.findById(providerTradeId);
    if (!providerTrade) {
      return { synced: 0, reason: 'PROVIDER_TRADE_NOT_FOUND' };
    }

    const signals = await this.tradeRepository.findById(providerTradeId);
    const subscriptionList = await this.copyRepository.listActiveSubscribersByProvider(
      providerTrade.provider_id,
    );

    let synced = 0;
    let failed = 0;

    for (const subscription of subscriptionList) {
      try {
        const userTrade = await this.tradeRepository.listTrades(
          { userId: subscription.subscriber_id, providerId: providerTrade.provider_id, symbol: providerTrade.normalized_symbol, status: ['OPEN', 'BREAK_EVEN', 'TRAILING_STOP', 'PARTIAL_CLOSE'] },
          { limit: 5, offset: 0 },
        );

        for (const trade of userTrade.trades) {
          if (this.closePosition) {
            await this.closePosition(trade, { reason });
          }
          await emitProviderStopSync(subscription.subscriber_id, trade.id);
          synced++;
        }
      } catch (error) {
        this.logger.error(
          { err: error, subscriberId: subscription.subscriber_id },
          'Provider stop sync failed',
        );
        await emitCopyFailed(subscription.subscriber_id, error.message);
        failed++;
      }
    }

    return { synced, failed, providerTradeId };
  }
}

export default ProviderStopSyncService;