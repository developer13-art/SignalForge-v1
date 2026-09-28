/**
 * Provider Revenue Dashboard Service
 *
 * @module signalforge/server/modules/providers/business/revenue-dashboard
 */

import { ProviderRevenueService } from '../revenue/service.js';
import { ProviderSubscriberService } from '../subscribers/service.js';

export class RevenueDashboardService {
  constructor(dependencies = {}) {
    this.revenue = dependencies.revenue || new ProviderRevenueService();
    this.subscribers = dependencies.subscribers || new ProviderSubscriberService();
  }

  async build(providerId, filters = {}) {
    const summary = await this.revenue.getSummary(providerId, filters);
    const revenueRecords = await this.revenue.listRevenue(providerId, filters, {
      limit: 12,
      offset: 0,
    });
    const subscribers = await this.subscribers.listSubscribers(providerId, {}, {
      limit: 20,
      offset: 0,
    });

    return {
      summary,
      recentRevenue: revenueRecords.records,
      recentSubscribers: subscribers.subscribers,
    };
  }
}

export default RevenueDashboardService;