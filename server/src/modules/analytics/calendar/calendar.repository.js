/**
 * Calendar Repository
 *
 * @module signalforge/server/modules/analytics/calendar/repository
 */
const { AnalyticsRepository } = require('../analytics.repository.js');
class CalendarRepository {
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
module.exports = CalendarRepository;
module.exports.CalendarRepository = CalendarRepository;
