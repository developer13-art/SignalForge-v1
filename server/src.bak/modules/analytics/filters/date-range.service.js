/**
 * Date Range Service
 *
 * @module signalforge/server/modules/analytics/filters/date-range
 */

import { DATE_RANGES } from '../analytics.constants.js';

function startOfDay(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

export class DateRangeService {
  resolve(range, options = {}) {
    const now = options.now ? new Date(options.now) : new Date();
    const today = startOfDay(now);

    switch (range) {
      case DATE_RANGES.TODAY:
        return { since: today.toISOString(), until: endOfDay(now).toISOString() };

      case DATE_RANGES.YESTERDAY: {
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          since: startOfDay(yesterday).toISOString(),
          until: endOfDay(yesterday).toISOString(),
        };
      }

      case DATE_RANGES.LAST_7_DAYS:
        return {
          since: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          until: endOfDay(now).toISOString(),
        };

      case DATE_RANGES.LAST_30_DAYS:
        return {
          since: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          until: endOfDay(now).toISOString(),
        };

      case DATE_RANGES.LAST_90_DAYS:
        return {
          since: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          until: endOfDay(now).toISOString(),
        };

      case DATE_RANGES.LAST_365_DAYS:
        return {
          since: new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          until: endOfDay(now).toISOString(),
        };

      case DATE_RANGES.MONTH_TO_DATE: {
        const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        return {
          since: startOfMonth.toISOString(),
          until: endOfDay(now).toISOString(),
        };
      }

      case DATE_RANGES.YEAR_TO_DATE: {
        const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
        return {
          since: startOfYear.toISOString(),
          until: endOfDay(now).toISOString(),
        };
      }

      case DATE_RANGES.ALL_TIME:
        return { since: null, until: null };

      case DATE_RANGES.CUSTOM:
        return {
          since: options.since || null,
          until: options.until || null,
        };

      default:
        return { since: null, until: null };
    }
  }

  validate({ since, until }) {
    if (since && until) {
      if (new Date(since).getTime() > new Date(until).getTime()) {
        return { valid: false, error: 'since must be before until' };
      }
    }
    return { valid: true };
  }

  countDays({ since, until }) {
    if (!since || !until) {
      return null;
    }
    const diffMs = new Date(until).getTime() - new Date(since).getTime();
    return Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  }
}

export default DateRangeService;