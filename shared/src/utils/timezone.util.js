/**
 * Timezone Utilities
 *
 * Provides timezone conversion and detection helpers used for trading
 * session calculations, KYC verification timestamps, and reporting.
 *
 * @module @signalforge/shared/utils/timezone
 */

const TRADING_SESSIONS = Object.freeze({
  SYDNEY: { open: '22:00', close: '07:00', timezone: 'Australia/Sydney' },
  TOKYO: { open: '00:00', close: '09:00', timezone: 'Asia/Tokyo' },
  LONDON: { open: '08:00', close: '17:00', timezone: 'Europe/London' },
  NEW_YORK: { open: '13:00', close: '22:00', timezone: 'America/New_York' },
});

export function getSessionForTime(date, sessionName) {
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const session = TRADING_SESSIONS[sessionName];
  if (!session) {
    return false;
  }

  const utcHours = parsed.getUTCHours();
  const utcMinutes = parsed.getUTCMinutes();
  const currentMinutes = utcHours * 60 + utcMinutes;

  const [openHour, openMinute] = session.open.split(':').map(Number);
  const [closeHour, closeMinute] = session.close.split(':').map(Number);

  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  if (openMinutes < closeMinutes) {
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
}

export function getActiveSessions(date = new Date()) {
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return [];
  }

  const active = [];
  for (const [name] of Object.entries(TRADING_SESSIONS)) {
    if (getSessionForTime(parsed, name)) {
      active.push(name);
    }
  }
  return active;
}

export function isMarketOpen(date = new Date()) {
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  const day = parsed.getUTCDay();
  if (day === 6) {
    return false;
  }
  if (day === 0 && parsed.getUTCHours() >= 22) {
    return false;
  }
  if (day === 5 && parsed.getUTCHours() >= 22) {
    return false;
  }
  return true;
}

export function convertToTimezone(date, timezone) {
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(parsed);
  } catch (err) {
    return null;
  }
}

export function formatInTimezone(date, timezone, locale = 'en-US') {
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(parsed);
  } catch (err) {
    return null;
  }
}

export function getTimezoneOffset(timezone, date = new Date()) {
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  try {
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    }).formatToParts(parsed);

    const offsetPart = formatted.find((part) => part.type === 'timeZoneName');
    if (!offsetPart) {
      return null;
    }

    return offsetPart.value;
  } catch (err) {
    return null;
  }
}

export function getTimezoneOffsetMinutes(timezone, date = new Date()) {
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  try {
    const utcFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const tzFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const utcParts = utcFormatter.formatToParts(parsed);
    const tzParts = tzFormatter.formatToParts(parsed);

    const utcHour = Number(utcParts.find((p) => p.type === 'hour').value);
    const utcMinute = Number(utcParts.find((p) => p.type === 'minute').value);
    const tzHour = Number(tzParts.find((p) => p.type === 'hour').value);
    const tzMinute = Number(tzParts.find((p) => p.type === 'minute').value);

    let offset = (tzHour * 60 + tzMinute) - (utcHour * 60 + utcMinute);
    if (offset > 720) {
      offset -= 1440;
    }
    if (offset < -720) {
      offset += 1440;
    }

    return offset;
  } catch (err) {
    return null;
  }
}

export function isValidTimezone(timezone) {
  if (typeof timezone !== 'string' || timezone.length === 0) {
    return false;
  }
  try {
    Intl.DateTimeFormat('en-US', { timeZone: timezone });
    return true;
  } catch (err) {
    return false;
  }
}

export function getAvailableSessions() {
  return Object.keys(TRADING_SESSIONS);
}

export function getSessionDefinition(sessionName) {
  return TRADING_SESSIONS[sessionName] || null;
}

export const TIMEZONE_CONSTANTS = Object.freeze({
  sessions: TRADING_SESSIONS,
  defaultTimezone: 'UTC',
});