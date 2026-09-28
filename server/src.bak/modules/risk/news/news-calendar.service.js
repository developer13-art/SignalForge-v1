/**
 * News Calendar Service
 *
 * @module signalforge/server/modules/risk/news/news-calendar
 */

import { getLogger } from '../../../bootstrap/initLogger.js';

export class NewsCalendarService {
  constructor() {
    this.logger = getLogger('news-calendar');
    this.events = [];
    this.cache = new Map();
  }

  setEvents(events) {
    this.events = Array.isArray(events) ? events : [];
    this.cache.clear();
  }

  addEvent(event) {
    if (!event || !event.timestamp) {
      return;
    }
    this.events.push(event);
  }

  getEventsForSymbol(symbol, fromTime, toTime) {
    if (!symbol) {
      return [];
    }
    const upperSymbol = String(symbol).toUpperCase();
    const fromMs = fromTime instanceof Date ? fromTime.getTime() : new Date(fromTime).getTime();
    const toMs = toTime instanceof Date ? toTime.getTime() : new Date(toTime).getTime();

    return this.events.filter((event) => {
      const timestamp = new Date(event.timestamp).getTime();
      if (Number.isNaN(timestamp)) {
        return false;
      }
      if (timestamp < fromMs || timestamp > toMs) {
        return false;
      }
      if (!event.affectedSymbols || event.affectedSymbols.length === 0) {
        return true;
      }
      return event.affectedSymbols.some(
        (s) => String(s).toUpperCase() === upperSymbol,
      );
    });
  }

  getHighImpactEvents(fromTime, toTime) {
    const fromMs = fromTime instanceof Date ? fromTime.getTime() : new Date(fromTime).getTime();
    const toMs = toTime instanceof Date ? toTime.getTime() : new Date(toTime).getTime();

    return this.events.filter((event) => {
      const timestamp = new Date(event.timestamp).getTime();
      if (Number.isNaN(timestamp)) {
        return false;
      }
      if (timestamp < fromMs || timestamp > toMs) {
        return false;
      }
      return event.impact === 'HIGH';
    });
  }
}

export default NewsCalendarService;