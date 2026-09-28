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
const MS_PER_WEEK = 7 * MS_PER_DAY;function nowIso() {
  return new Date().toISOString();
}function nowUnix() {
  return Math.floor(Date.now() / MS_PER_SECOND);
}function toIso(date) {
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
}function parseDate(input) {
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
}function addSeconds(date, seconds) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  return new Date(parsed.getTime() + seconds * MS_PER_SECOND);
}function addMinutes(date, minutes) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  return new Date(parsed.getTime() + minutes * MS_PER_MINUTE);
}function addHours(date, hours) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  return new Date(parsed.getTime() + hours * MS_PER_HOUR);
}function addDays(date, days) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  return new Date(parsed.getTime() + days * MS_PER_DAY);
}function addWeeks(date, weeks) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  return new Date(parsed.getTime() + weeks * MS_PER_WEEK);
}function addMonths(date, months) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const result = new Date(parsed.getTime());
  result.setMonth(result.getMonth() + months);
  return result;
}function addYears(date, years) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const result = new Date(parsed.getTime());
  result.setFullYear(result.getFullYear() + years);
  return result;
}function diffMs(dateA, dateB) {
  const a = parseDate(dateA);
  const b = parseDate(dateB);
  if (!a || !b) {
    return null;
  }
  return a.getTime() - b.getTime();
}function diffSeconds(dateA, dateB) {
  const ms = diffMs(dateA, dateB);
  return ms === null ? null : Math.floor(ms / MS_PER_SECOND);
}function diffMinutes(dateA, dateB) {
  const ms = diffMs(dateA, dateB);
  return ms === null ? null : Math.floor(ms / MS_PER_MINUTE);
}function diffHours(dateA, dateB) {
  const ms = diffMs(dateA, dateB);
  return ms === null ? null : Math.floor(ms / MS_PER_HOUR);
}function diffDays(dateA, dateB) {
  const ms = diffMs(dateA, dateB);
  return ms === null ? null : Math.floor(ms / MS_PER_DAY);
}function isPast(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return false;
  }
  return parsed.getTime() < Date.now();
}function isFuture(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return false;
  }
  return parsed.getTime() > Date.now();
}function isWithin(date, from, to) {
  const parsed = parseDate(date);
  const parsedFrom = parseDate(from);
  const parsedTo = parseDate(to);
  if (!parsed || !parsedFrom || !parsedTo) {
    return false;
  }
  return parsed.getTime() >= parsedFrom.getTime() && parsed.getTime() <= parsedTo.getTime();
}function startOfDay(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const result = new Date(parsed.getTime());
  result.setUTCHours(0, 0, 0, 0);
  return result;
}function endOfDay(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const result = new Date(parsed.getTime());
  result.setUTCHours(23, 59, 59, 999);
  return result;
}function startOfWeek(date) {
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
}function startOfMonth(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const result = new Date(parsed.getTime());
  result.setUTCDate(1);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}function endOfMonth(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const result = new Date(parsed.getTime());
  result.setUTCMonth(result.getUTCMonth() + 1);
  result.setUTCDate(0);
  result.setUTCHours(23, 59, 59, 999);
  return result;
}function startOfYear(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const result = new Date(parsed.getTime());
  result.setUTCMonth(0);
  result.setUTCDate(1);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}function endOfYear(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const result = new Date(parsed.getTime());
  result.setUTCMonth(11);
  result.setUTCDate(31);
  result.setUTCHours(23, 59, 59, 999);
  return result;
}function getSettlementPeriod(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}function parseSettlementPeriod(period) {
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
}function getPreviousSettlementPeriod(date = new Date()) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const previous = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth() - 1, 1));
  return getSettlementPeriod(previous);
}function getCurrentSettlementPeriod(date = new Date()) {
  return getSettlementPeriod(date);
}function formatDuration(ms) {
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
}const DATE_CONSTANTS = Object.freeze({
  MS_PER_SECOND,
  MS_PER_MINUTE,
  MS_PER_HOUR,
  MS_PER_DAY,
  MS_PER_WEEK,
});

module.exports.nowIso = nowIso;
module.exports.nowUnix = nowUnix;
module.exports.toIso = toIso;
module.exports.parseDate = parseDate;
module.exports.addSeconds = addSeconds;
module.exports.addMinutes = addMinutes;
module.exports.addHours = addHours;
module.exports.addDays = addDays;
module.exports.addWeeks = addWeeks;
module.exports.addMonths = addMonths;
module.exports.addYears = addYears;
module.exports.diffMs = diffMs;
module.exports.diffSeconds = diffSeconds;
module.exports.diffMinutes = diffMinutes;
module.exports.diffHours = diffHours;
module.exports.diffDays = diffDays;
module.exports.isPast = isPast;
module.exports.isFuture = isFuture;
module.exports.isWithin = isWithin;
module.exports.startOfDay = startOfDay;
module.exports.endOfDay = endOfDay;
module.exports.startOfWeek = startOfWeek;
module.exports.startOfMonth = startOfMonth;
module.exports.endOfMonth = endOfMonth;
module.exports.startOfYear = startOfYear;
module.exports.endOfYear = endOfYear;
module.exports.getSettlementPeriod = getSettlementPeriod;
module.exports.parseSettlementPeriod = parseSettlementPeriod;
module.exports.getPreviousSettlementPeriod = getPreviousSettlementPeriod;
module.exports.getCurrentSettlementPeriod = getCurrentSettlementPeriod;
module.exports.formatDuration = formatDuration;
module.exports.MS_PER_SECOND = MS_PER_SECOND;
module.exports.MS_PER_MINUTE = MS_PER_MINUTE;
module.exports.MS_PER_HOUR = MS_PER_HOUR;
module.exports.MS_PER_DAY = MS_PER_DAY;
module.exports.MS_PER_WEEK = MS_PER_WEEK;
module.exports.DATE_CONSTANTS = DATE_CONSTANTS;
