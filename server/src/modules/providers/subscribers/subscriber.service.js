/**
 * Provider Subscriber Service
 *
 * @module signalforge/server/modules/providers/subscribers/service
 */

import { ProviderSubscriberRepository } from './repository.js';
import {
  emitProviderSubscriberAdded,
  emitProviderSubscriberRemoved,
} from '../provider.events.js';

export class ProviderSubscriberService {
  constructor(repository = null) {
    this.repository = repository || new ProviderSubscriberRepository();
  }

  async addSubscriber(providerId, subscriberId, subscriptionId = null) {
    const existing = await this.repository.find(providerId, subscriberId);
    if (existing && existing.status === 'ACTIVE') {
      return this.serialize(existing);
    }

    const created =
      existing ||
      (await this.repository.create({
        providerId,
        subscriberId,
        subscriptionId,
        status: 'ACTIVE',
      }));

    if (!created) {
      const found = await this.repository.find(providerId, subscriberId);
      return this.serialize(found);
    }

    await this.repository.incrementProviderCount(providerId);
    await emitProviderSubscriberAdded(providerId, subscriberId);

    return this.serialize(created);
  }

  async removeSubscriber(providerId, subscriberId) {
    const subscriber = await this.repository.find(providerId, subscriberId);
    if (!subscriber || subscriber.status !== 'ACTIVE') {
      return null;
    }

    await this.repository.update(subscriber.id, {
      status: 'INACTIVE',
      leftAt: new Date(),
    });
    await this.repository.decrementProviderCount(providerId);
    await emitProviderSubscriberRemoved(providerId, subscriberId);

    return this.serialize({ ...subscriber, status: 'INACTIVE' });
  }

  async listSubscribers(providerId, filters = {}, pagination = {}) {
    const result = await this.repository.list(providerId, filters, pagination);
    return {
      subscribers: result.subscribers.map((s) => this.serialize(s)),
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
      providerId: row.provider_id,
      subscriberId: row.subscriber_id,
      subscriptionId: row.subscription_id,
      status: row.status,
      joinedAt: row.joined_at,
      leftAt: row.left_at,
    };
  }
}

export default ProviderSubscriberService;