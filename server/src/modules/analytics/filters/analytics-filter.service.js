/**
 * Analytics Filter Service
 *
 * @module signalforge/server/modules/analytics/filters/analytics-filter
 */

import { DateRangeService } from './date-range.service.js';

export class AnalyticsFilterService {
  constructor(dateRange = null) {
    this.dateRange = dateRange || new DateRangeService();
  }

  build(filters = {}) {
    const normalized = {};
    if (filters.dateRange) {
      const range = this.dateRange.resolve(filters.dateRange, filters);
      normalized.since = range.since;
      normalized.until = range.until;
    } else {
      if (filters.since) {
        normalized.since = new Date(filters.since).toISOString();
      }
      if (filters.until) {
        normalized.until = new Date(filters.until).toISOString();
      }
    }

    if (filters.brokerAccountId) {
      normalized.brokerAccountId = filters.brokerAccountId;
    }
    if (filters.providerId) {
      normalized.providerId = filters.providerId;
    }
    if (filters.symbol) {
      normalized.symbol = filters.symbol;
    }
    if (filters.direction) {
      normalized.direction = filters.direction;
    }
    if (filters.status) {
      normalized.status = filters.status;
    }

    return normalized;
  }

  normalizePagination(pagination = {}) {
    return {
      limit: Math.min(Math.max(Number(pagination.limit) || 20, 1), 200),
      offset: Math.max(Number(pagination.offset) || 0, 0),
    };
  }
}

export default AnalyticsFilterService;