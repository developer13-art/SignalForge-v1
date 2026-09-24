/**
 * Date Formatter
 *
 * @module client/src/lib/formatters/date.formatter
 */

import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

const DEFAULT_DATE_FORMAT = 'MMM d, yyyy';
const DEFAULT_TIME_FORMAT = 'HH:mm';
const DEFAULT_DATETIME_FORMAT = 'MMM d, yyyy HH:mm';

function toDate(input) {
  if (!input) {
    return null;
  }
  if (input instanceof Date) {
    return isValid(input) ? input : null;
  }
  if (typeof input === 'string' || typeof input === 'number') {
    const parsed = typeof input === 'string' ? parseISO(input) : new Date(input);
    return isValid(parsed) ? parsed : null;
  }
  return null;
}

export function formatDate(input, pattern = DEFAULT_DATE_FORMAT) {
  const date = toDate(input);
  if (!date) {
    return '—';
  }
  return format(date, pattern);
}

export function formatDateTime(input, pattern = DEFAULT_DATETIME_FORMAT) {
  return formatDate(input, pattern);
}

export function formatTime(input, pattern = DEFAULT_TIME_FORMAT) {
  return formatDate(input, pattern);
}

export function formatRelative(input) {
  const date = toDate(input);
  if (!date) {
    return '—';
  }
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatCompactRelative(input) {
  const date = toDate(input);
  if (!date) {
    return '—';
  }

  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays}d ago`;
  }

  return formatDate(date);
}

export function formatDuration(ms) {
  if (typeof ms !== 'number' || ms < 0) {
    return '—';
  }
  const seconds = Math.floor(ms / 1000);
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

export const dateFormatter = {
  formatDate,
  formatDateTime,
  formatTime,
  formatRelative,
  formatCompactRelative,
  formatDuration,
};