/**
 * News Filter Service
 *
 * @module signalforge/server/modules/risk/news/news-filter
 */

import { NewsCalendarService } from './news-calendar.service.js';

export class NewsFilterService {
  constructor(calendar = null) {
    this.calendar = calendar || new NewsCalendarService();
  }

  async checkBlock({ symbol, referenceTime, minutesBefore = 15, minutesAfter = 15 }) {
    if (!symbol) {
      return { blocked: false, reason: 'NO_SYMBOL' };
    }

    const ref = referenceTime instanceof Date ? referenceTime : new Date(referenceTime);

    const fromTime = new Date(ref.getTime() - minutesBefore * 60 * 1000);
    const toTime = new Date(ref.getTime() + minutesAfter * 60 * 1000);

    const events = this.calendar.getEventsForSymbol(symbol, fromTime, toTime);
    const highImpact = events.filter((event) => event.impact === 'HIGH');

    if (highImpact.length > 0) {
      return {
        blocked: true,
        reason: 'HIGH_IMPACT_NEWS',
        event: highImpact[0],
        window: { from: fromTime.toISOString(), to: toTime.toISOString() },
      };
    }

    return { blocked: false };
  }
}

export default NewsFilterService;