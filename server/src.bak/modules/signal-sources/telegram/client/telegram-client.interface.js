/**
 * Telegram Client Interface
 *
 * Abstract interface and adapter creation for the underlying Telegram
 * library. The rest of the platform depends only on the methods
 * exposed here, so the actual library (GramJS, mtcute, or any future
 * implementation) can be swapped without touching any other file.
 *
 * @module server/modules/signal-sources/telegram/client/telegram-client.interface
 */

import { AppError } from '../../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../../lib/errors/error-codes';
import { EventEmitter } from 'node:events';

const REQUIRED_METHODS = Object.freeze([
  'sendCode',
  'signIn',
  'checkPassword',
  'isPasswordNeeded',
  'listDialogs',
  'openListenerConnection',
  'downloadMedia',
  'destroy',
]);

export function assertImplementsInterface(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    throw new AppError('Telegram client adapter must be an object', ERROR_CODES.TELEGRAM_CLIENT_INVALID, 500);
  }

  for (const method of REQUIRED_METHODS) {
    if (typeof candidate[method] !== 'function') {
      throw new AppError(
        `Telegram client adapter is missing required method: ${method}`,
        ERROR_CODES.TELEGRAM_CLIENT_INVALID,
        500,
      );
    }
  }
}

/**
 * Create a Telegram client adapter.
 *
 * The default implementation throws "not implemented" for every method
 * until a concrete adapter is registered during bootstrap. This allows
 * tests to substitute a mock adapter and allows the platform to boot
 * without a Telegram library installed.
 *
 * @param {object} options
 * @returns {object}
 */
export function createTelegramClientAdapter(options = {}) {
  const { apiId, apiHash, sessionEncryptionKey, userId, logger } = options;

  if (!apiId || !apiHash) {
    throw new AppError(
      'Telegram apiId and apiHash are required to create a client adapter',
      ERROR_CODES.CONFIGURATION_MISSING,
      500,
    );
  }

  if (!userId) {
    throw new AppError('userId is required to create a client adapter', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const registry = GLOBAL_REGISTRY;
  if (registry && typeof registry.factory === 'function') {
    const adapter = registry.factory({ apiId, apiHash, sessionEncryptionKey, userId, logger });
    assertImplementsInterface(adapter);
    return adapter;
  }

  return createNoopAdapter({ userId, logger });
}

function createNoopAdapter({ userId, logger }) {
  const emitter = new EventEmitter();

  function notImplemented(method) {
    return async () => {
      if (logger) {
        logger.warn({ userId, method }, 'Telegram client method invoked on no-op adapter');
      }
      throw new AppError(
        `Telegram client adapter is not configured for method: ${method}`,
        ERROR_CODES.TELEGRAM_CLIENT_NOT_IMPLEMENTED,
        500,
      );
    };
  }

  return {
    sendCode: notImplemented('sendCode'),
    signIn: notImplemented('signIn'),
    checkPassword: notImplemented('checkPassword'),
    isPasswordNeeded: notImplemented('isPasswordNeeded'),
    listDialogs: notImplemented('listDialogs'),
    downloadMedia: notImplemented('downloadMedia'),
    async openListenerConnection() {
      if (logger) {
        logger.warn({ userId }, 'openListenerConnection invoked on no-op adapter');
      }
      throw new AppError(
        'Telegram client adapter is not configured',
        ERROR_CODES.TELEGRAM_CLIENT_NOT_IMPLEMENTED,
        500,
      );
    },
    destroy() {
      emitter.removeAllListeners();
    },
    _emitter: emitter,
  };
}

const GLOBAL_REGISTRY = {
  factory: null,
};

export function registerTelegramClientFactory(factory) {
  if (typeof factory !== 'function') {
    throw new AppError(
      'Telegram client factory must be a function',
      ERROR_CODES.VALIDATION_FAILED,
      500,
    );
  }
  GLOBAL_REGISTRY.factory = factory;
}

export function clearTelegramClientFactory() {
  GLOBAL_REGISTRY.factory = null;
}

export const TELEGRAM_CLIENT_REQUIRED_METHODS = REQUIRED_METHODS;