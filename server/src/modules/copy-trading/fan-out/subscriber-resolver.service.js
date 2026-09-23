/**
 * Subscriber Resolver Service
 *
 * @module signalforge/server/modules/copy-trading/fan-out/subscriber-resolver
 */

import { CopyTradingRepository } from '../copy-trading.repository.js';
import { normalizeSymbol } from '@signalforge/shared/validators/symbol.validator';

export class SubscriberResolverService {
  constructor(repository = null) {
    this.repository = repository || new CopyTradingRepository();
  }

  matchesSubscription(subscription, signal) {
    const symbol = normalizeSymbol(signal.normalizedSymbol || signal.symbol);
    if (!symbol) {
      return false;
    }

    if (
      Array.isArray(subscription.blocked_symbols) &&
      subscription.blocked_symbols.includes(symbol)
    ) {
      return false;
    }

    if (
      Array.isArray(subscription.allowed_symbols) &&
      subscription.allowed_symbols.length > 0 &&
      !subscription.allowed_symbols.includes(symbol)
    ) {
      return false;
    }

    return true;
  }

  async resolveSubscribers(providerId, signal, options = {}) {
    const subscriptions = await this.repository.listActiveSubscribersByProvider(providerId);

    const filtered = subscriptions.filter((sub) =>
      this.matchesSubscription(sub, signal),
    );

    if (options.excludedSubscriberIds && options.excludedSubscriberIds.length > 0) {
      const excluded = new Set(options.excludedSubscriberIds);
      return filtered.filter((sub) => !excluded.has(sub.subscriber_id));
    }

    return filtered;
  }

  async getSubscriberCount(providerId) {
    return this.repository.countSubscribersByProvider(providerId);
  }
}

export default SubscriberResolverService;