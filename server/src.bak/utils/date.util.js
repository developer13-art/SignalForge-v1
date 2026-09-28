/**
 * Date Utilities
 *
 * @module server/utils/date.util
 */

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

export function nowIso() {
  return new Date().toISOString();
}

export function nowUnix() {
  return Math.floor(Date.now() / MS_PER_SECOND);
}

export function addMs(date, ms) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  return new Date(parsed.getTime() + ms);
}

export function addSeconds(date, seconds) {
  return addMs(date, seconds * MS_PER_SECOND);
}

export function addMinutes(date, minutes) {
  return addMs(date, minutes * MS_PER_MINUTE);
}

export function addHours(date, hours) {
  return addMs(date, hours * MS_PER_HOUR);
}

export function addDays(date, days) {
  return addMs(date, days * MS_PER_DAY);
}

export function diffMs(a, b) {
  const a1 = parseDate(a);
  const b1 = parseDate(b);
  if (!a1 || !b1) {
    return null;
  }
  return a1.getTime() - b1.getTime();
}

export function diffSeconds(a, b) {
  const ms = diffMs(a, b);
  return ms === null ? null : Math.floor(ms / MS_PER_SECOND);
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

export function parseDate(input) {
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input;
  }
  if (typeof input === 'string' || typeof input === 'number') {
    const parsed = new Date(input);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export function toIso(date) {
  const parsed = parseDate(date);
  return parsed ? parsed.toISOString() : null;
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

export function getSettlementPeriod(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export const dateUtil = {
  nowIso,
  nowUnix,
  addMs,
  addSeconds,
  addMinutes,
  addHours,
  addDays,
  diffMs,
  diffSeconds,
  isPast,
  isFuture,
  parseDate,
  toIso,
  startOfDay,
  endOfDay,
  getSettlementPeriod,
  MS_PER_SECOND,
  MS_PER_MINUTE,
  MS_PER_HOUR,
  MS_PER_DAY,
};