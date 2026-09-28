/**
 * Date Utilities
 *
 * @module server/utils/date.util
 */

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;
function nowIso() {
  return new Date().toISOString();
}
function nowUnix() {
  return Math.floor(Date.now() / MS_PER_SECOND);
}
function addMs(date, ms) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  return new Date(parsed.getTime() + ms);
}
function addSeconds(date, seconds) {
  return addMs(date, seconds * MS_PER_SECOND);
}
function addMinutes(date, minutes) {
  return addMs(date, minutes * MS_PER_MINUTE);
}
function addHours(date, hours) {
  return addMs(date, hours * MS_PER_HOUR);
}
function addDays(date, days) {
  return addMs(date, days * MS_PER_DAY);
}
function diffMs(a, b) {
  const a1 = parseDate(a);
  const b1 = parseDate(b);
  if (!a1 || !b1) {
    return null;
  }
  return a1.getTime() - b1.getTime();
}
function diffSeconds(a, b) {
  const ms = diffMs(a, b);
  return ms === null ? null : Math.floor(ms / MS_PER_SECOND);
}
function isPast(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return false;
  }
  return parsed.getTime() < Date.now();
}
function isFuture(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return false;
  }
  return parsed.getTime() > Date.now();
}
function parseDate(input) {
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input;
  }
  if (typeof input === 'string' || typeof input === 'number') {
    const parsed = new Date(input);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}
function toIso(date) {
  const parsed = parseDate(date);
  return parsed ? parsed.toISOString() : null;
}
function startOfDay(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const result = new Date(parsed.getTime());
  result.setUTCHours(0, 0, 0, 0);
  return result;
}
function endOfDay(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const result = new Date(parsed.getTime());
  result.setUTCHours(23, 59, 59, 999);
  return result;
}
function getSettlementPeriod(date) {
  const parsed = parseDate(date);
  if (!parsed) {
    return null;
  }
  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
const dateUtil = {
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
module.exports.dateUtil = dateUtil;
module.exports.nowIso = nowIso;
module.exports.nowUnix = nowUnix;
module.exports.addMs = addMs;
module.exports.addSeconds = addSeconds;
module.exports.addMinutes = addMinutes;
module.exports.addHours = addHours;
module.exports.addDays = addDays;
module.exports.diffMs = diffMs;
module.exports.diffSeconds = diffSeconds;
module.exports.isPast = isPast;
module.exports.isFuture = isFuture;
module.exports.parseDate = parseDate;
module.exports.toIso = toIso;
module.exports.startOfDay = startOfDay;
module.exports.endOfDay = endOfDay;
module.exports.getSettlementPeriod = getSettlementPeriod;
