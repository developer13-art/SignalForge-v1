/**
 * Calendar Repository
 *
 * @module signalforge/server/modules/analytics/calendar/repository
 */

import { AnalyticsRepository } from '../analytics.repository.js';

export class CalendarRepository {
  constructor(db = null) {
    this.analyticsRepository = new AnalyticsRepository(db);
  }

  async aggregateByDay(userId, filters) {
    return this.analyticsRepository.aggregateTradesByDay(userId, filters);
  }

  async aggregateBySymbol(userId, filters) {
    return this.analyticsRepository.aggregateTradesBySymbol(userId, filters);
  }

  async aggregateByProvider(userId, filters) {
    return this.analyticsRepository.aggregateTradesByProvider(userId, filters);
  }
}

export default CalendarRepository;