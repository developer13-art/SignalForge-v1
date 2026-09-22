/**
 * Date Utilities
 *
 * Provides date and time helpers used across the SignalForge platform
 * for timestamps, period calculations, and expiry checks.
 *
 * @module @signalforge/shared/utils/date
 */

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const MS_PER_WEEK = 7 * MS_PER_DAY;

export function nowIso() {
  return new Date().toISOString();
}

export function nowUnix() {
  return Math.floor(Date.now() / MS_PER_SECOND);
}

export function toIso(date) {
  if (date instanceof Date) {
    return date.toISOString();
  }
  if (typeof date === 'string' || typeof date === 'number') {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toISOString();
  }
  return null;
}

export function parseDate(input) {
  if (input instanceof Date) {
    return input;
  }
  if (typeof input === 'string' || typeof input === 'number') {
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed;
  }
  return null;
}

export function addSeconds(date, seconds) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  return new Date(parsed.getTime() + seconds * MS_PER_SECOND);
}

export function addMinutes(date, minutes) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  return new Date(parsed.getTime() + minutes * MS_PER_MINUTE);
}

export function addHours(date, hours) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  return new Date(parsed.getTime() + hours * MS_PER_HOUR);
}

export function addDays(date, days) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  return new Date(parsed.getTime() + days * MS_PER_DAY);
}

export function addWeeks(date, weeks) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  return new Date(parsed.getTime() + weeks * MS_PER_WEEK);
}

export function addMonths(date, months) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const result = new Date(parsed.getTime());
  result.setMonth(result.getMonth() + months);
  return result;
}

export function addYears(date, years) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const result = new Date(parsed.getTime());
  result.setFullYear(result.getFullYear() + years);
  return result;
}

export function diffMs(dateA, dateB) {
  const a = parseDate(dateA);
  const b = parseDate(dateB);
  if (!a || !b) {
    return null;
  }
  return a.getTime() - b.getTime();
}

export function diffSeconds(dateA, dateB) {
  const ms = diffMs(dateA, dateB);
  return ms === null ? null : Math.floor(ms / MS_PER_SECOND);
}

export function diffMinutes(dateA, dateB) {
  const ms = diffMs(dateA, dateB);
  return ms === null ? null : Math.floor(ms / MS_PER_MINUTE);
}

export function diffHours(dateA, dateB) {
  const ms = diffMs(dateA, dateB);
  return ms === null ? null : Math.floor(ms / MS_PER_HOUR);
}

export function diffDays(dateA, dateB) {
  const ms = diffMs(dateA, dateB);
  return ms === null ? null : Math.floor(ms / MS_PER_DAY);
}

export function isPast(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return false;
  }
  return parsed.getTime() < Date.now();
}

export function isFuture(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return false;
  }
  return parsed.getTime() > Date.now();
}

export function isWithin(date, from, to) {
  const parsed = parseDate(date);
  const parsedFrom = parseDate(from);
  const parsedTo = parseDate(to);
  if (!parsed || !parsedFrom || !parsedTo) {
    return false;
  }
  return parsed.getTime() >= parsedFrom.getTime() && parsed.getTime() <= parsedTo.getTime();
}

export function startOfDay(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const result = new Date(parsed.getTime());
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const result = new Date(parsed.getTime());
  result.setUTCHours(23, 59, 59, 999);
  return result;
}

export function startOfWeek(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const result = new Date(parsed.getTime());
  const day = result.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  result.setUTCDate(result.getUTCDate() - diff);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

export function startOfMonth(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const result = new Date(parsed.getTime());
  result.setUTCDate(1);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

export function endOfMonth(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const result = new Date(parsed.getTime());
  result.setUTCMonth(result.getUTCMonth() + 1);
  result.setUTCDate(0);
  result.setUTCHours(23, 59, 59, 999);
  return result;
}

export function startOfYear(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const result = new Date(parsed.getTime());
  result.setUTCMonth(0);
  result.setUTCDate(1);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

export function endOfYear(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const result = new Date(parsed.getTime());
  result.setUTCMonth(11);
  result.setUTCDate(31);
  result.setUTCHours(23, 59, 59, 999);
  return result;
}

export function getSettlementPeriod(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function parseSettlementPeriod(period) {
  if (typeof period !== 'string' || !/^\d{4}-\d{2}$/.test(period)) {
    return null;
  }
  const [yearStr, monthStr] = period.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (month < 1 || month > 12) {
    return null;
  }
  return {
    year,
    month,
    start: new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)),
    end: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
  };
}

export function getPreviousSettlementPeriod(date = new Date()) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const previous = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth() - 1, 1));
  return getSettlementPeriod(previous);
}

export function getCurrentSettlementPeriod(date = new Date()) {
  return getSettlementPeriod(date);
}

export function formatDuration(ms) {
  if (typeof ms !== 'number' || ms < 0) {
    return null;
  }
  const seconds = Math.floor(ms / MS_PER_SECOND);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export const DATE_CONSTANTS = Object.freeze({
  MS_PER_SECOND,
  MS_PER_MINUTE,
  MS_PER_HOUR,
  MS_PER_DAY,
  MS_PER_WEEK,
});