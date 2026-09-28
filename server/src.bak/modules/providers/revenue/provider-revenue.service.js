/**
 * Provider Revenue Service
 *
 * @module signalforge/server/modules/providers/revenue/service
 */

import { ProviderRevenueRepository } from './repository.js';
import { emitProviderRevenueUpdated } from '../provider.events.js';

export class ProviderRevenueService {
  constructor(repository = null) {
    this.repository = repository || new ProviderRevenueRepository();
  }

  async recordRevenue(providerId, userId, data) {
    const gross = Number(data.grossRevenue || 0);
    const platformFee = Number(data.platformFee || 0);
    const net = Number((gross - platformFee).toFixed(2));

    const created = await this.repository.upsert({
      providerId,
      userId,
      period: data.period,
      grossRevenue: gross,
      platformFee,
      netRevenue: net,
      subscriberCount: data.subscriberCount ?? 0,
      currency: data.currency || 'USD',
      metadata: data.metadata || null,
    });

    await emitProviderRevenueUpdated(providerId, data.period, {
      gross,
      platformFee,
      net,
    });

    return this.serialize(created);
  }

  async listRevenue(providerId, filters = {}, pagination = {}) {
    const result = await this.repository.list(providerId, filters, pagination);
    return {
      records: result.records.map((r) => this.serialize(r)),
      limit: result.limit,
      offset: result.offset,
    };
  }

  async getSummary(providerId, filters = {}) {
    return this.repository.sum(providerId, filters);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      providerId: row.provider_id,
      period: row.period,
      grossRevenue: row.gross_revenue,
      platformFee: row.platform_fee,
      netRevenue: row.net_revenue,
      subscriberCount: row.subscriber_count,
      currency: row.currency,
      status: row.status,
      recordedAt: row.recorded_at,
      createdAt: row.created_at,
    };
  }
}

export default ProviderRevenueService;