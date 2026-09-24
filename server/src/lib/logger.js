/**
 * Logger
 *
 * Structured JSON logger with level filtering, request context, and
 * safe serialization for Errors. In production the logger emits one
 * JSON object per line so log aggregation systems can parse it
 * without configuration.
 *
 * @module server/lib/logger
 */

import os from 'node:os';
import process from 'node:process';
import { config } from '../config';

const LEVELS = Object.freeze({
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
});

const ACTIVE_LEVEL = LEVELS[(config.logger && config.logger.level) || 'info'] || LEVELS.info;

const SERVICE_NAME = 'signalforge-server';
const HOSTNAME = os.hostname();
const PID = process.pid;
const IS_PRODUCTION = (config.app && config.app.env) === 'production';

function serializeError(err) {
  if (!err) {
    return null;
  }

  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: IS_PRODUCTION ? undefined : err.stack,
      code: err.code || null,
      details: err.details || null,
    };
  }

  return {
    name: 'NonError',
    message: String(err),
  };
}

function normalizeContext(context) {
  if (!context || typeof context !== 'object') {
    return {};
  }

  const normalized = {};

  for (const [key, value] of Object.entries(context)) {
    if (value instanceof Error) {
      normalized[key] = serializeError(value);
    } else {
      normalized[key] = value;
    }
  }

  return normalized;
}

function write({ level, message, context }) {
  if (LEVELS[level] < ACTIVE_LEVEL) {
    return;
  }

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: SERVICE_NAME,
    hostname: HOSTNAME,
    pid: PID,
    message,
    ...normalizeContext(context),
  };

  const line = IS_PRODUCTION
    ? JSON.stringify(entry)
    : `[${entry.timestamp}] ${level.toUpperCase()} ${message} ${JSON.stringify(normalizeContext(context))}`;

  if (level === 'error' || level === 'fatal') {
    process.stderr.write(`${line}\n`);
  } else {
    process.stdout.write(`${line}\n`);
  }
}

export const logger = {
  trace: (context, message) => {
    if (typeof context === 'string') {
      write({ level: 'trace', message: context, context: {} });
      return;
    }
    write({ level: 'trace', message, context });
  },
  debug: (context, message) => {
    if (typeof context === 'string') {
      write({ level: 'debug', message: context, context: {} });
      return;
    }
    write({ level: 'debug', message, context });
  },
  info: (context, message) => {
    if (typeof context === 'string') {
      write({ level: 'info', message: context, context: {} });
      return;
    }
    write({ level: 'info', message, context });
  },
  warn: (context, message) => {
    if (typeof context === 'string') {
      write({ level: 'warn', message: context, context: {} });
      return;
    }
    write({ level: 'warn', message, context });
  },
  error: (context, message) => {
    if (typeof context === 'string') {
      write({ level: 'error', message: context, context: {} });
      return;
    }
    write({ level: 'error', message, context });
  },
  fatal: (context, message) => {
    if (typeof context === 'string') {
      write({ level: 'fatal', message: context, context: {} });
      return;
    }
    write({ level: 'fatal', message, context });
  },
  child: (baseContext) => {
    const bind = (level) => (context, message) => {
      const merged = { ...baseContext, ...normalizeContext(context) };
      if (typeof context === 'string') {
        write({ level, message: context, context: baseContext });
        return;
      }
      write({ level, message, context: merged });
    };

    return {
      trace: bind('trace'),
      debug: bind('debug'),
      info: bind('info'),
      warn: bind('warn'),
      error: bind('error'),
      fatal: bind('fatal'),
    };
  },
};

export default logger;