/**
 * Signal Source Registry
 *
 * Central registry of all signal source adapters supported by the
 * SignalForge platform. Each adapter normalizes its source-specific
 * messages into the shared signal collection pipeline. The registry
 * is the single entry point used by the Signal Collection Service to
 * resolve a source type to its adapter implementation.
 *
 * @module server/modules/signal-sources/source.registry
 */

import { SOURCE_TYPES, SOURCE_TYPE_VALUES } from '@signalforge/shared/constants/source-types';
import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';

/**
 * In-memory registry of registered source adapters.
 * Adapters are registered during bootstrap and resolved at runtime.
 *
 * @type {Map<string, object>}
 */
const adapters = new Map();

/**
 * Register a signal source adapter.
 *
 * @param {string} sourceType - One of SOURCE_TYPES values
 * @param {object} adapter - The adapter implementation
 * @param {Function} adapter.normalize - Converts a source message into a canonical message envelope
 * @param {Function} [adapter.validate] - Optional source-specific validation
 * @param {Function} [adapter.start] - Optional listener startup
 * @param {Function} [adapter.stop] - Optional listener shutdown
 * @param {Function} [adapter.health] - Optional health check
 * @returns {void}
 */
export function registerAdapter(sourceType, adapter) {
  if (!SOURCE_TYPE_VALUES.includes(sourceType)) {
    throw new AppError(
      `Cannot register adapter for unknown source type: ${sourceType}`,
      ERROR_CODES.SOURCE_TYPE_UNKNOWN,
      500,
    );
  }

  if (!adapter || typeof adapter !== 'object') {
    throw new AppError(
      `Adapter for source type ${sourceType} must be an object`,
      ERROR_CODES.SOURCE_ADAPTER_INVALID,
      500,
    );
  }

  if (typeof adapter.normalize !== 'function') {
    throw new AppError(
      `Adapter for source type ${sourceType} must implement normalize()`,
      ERROR_CODES.SOURCE_ADAPTER_INVALID,
      500,
    );
  }

  if (adapters.has(sourceType)) {
    throw new AppError(
      `Adapter for source type ${sourceType} is already registered`,
      ERROR_CODES.SOURCE_ADAPTER_DUPLICATE,
      500,
    );
  }

  adapters.set(sourceType, adapter);
}

/**
 * Resolve a source adapter by type.
 *
 * @param {string} sourceType
 * @returns {object}
 */
export function resolveAdapter(sourceType) {
  if (!SOURCE_TYPE_VALUES.includes(sourceType)) {
    throw new AppError(
      `Unknown source type: ${sourceType}`,
      ERROR_CODES.SOURCE_TYPE_UNKNOWN,
      400,
    );
  }

  const adapter = adapters.get(sourceType);

  if (!adapter) {
    throw new AppError(
      `No adapter registered for source type: ${sourceType}`,
      ERROR_CODES.SOURCE_ADAPTER_NOT_FOUND,
      500,
    );
  }

  return adapter;
}

/**
 * Check whether an adapter is registered for a source type.
 *
 * @param {string} sourceType
 * @returns {boolean}
 */
export function hasAdapter(sourceType) {
  return adapters.has(sourceType);
}

/**
 * Return a list of all registered source types.
 *
 * @returns {string[]}
 */
export function listRegisteredSourceTypes() {
  return Array.from(adapters.keys());
}

/**
 * Return a list of all supported source types, whether or not an
 * adapter is currently registered.
 *
 * @returns {string[]}
 */
export function listSupportedSourceTypes() {
  return [...SOURCE_TYPE_VALUES];
}

/**
 * Remove a registered adapter. Intended for testing or graceful
 * teardown during hot reload in development.
 *
 * @param {string} sourceType
 * @returns {boolean}
 */
export function unregisterAdapter(sourceType) {
  return adapters.delete(sourceType);
}

/**
 * Clear all registered adapters. Intended only for test setup and
 * teardown.
 *
 * @returns {void}
 */
export function clearAdapters() {
  adapters.clear();
}

/**
 * Return metadata about the current registry state.
 *
 * @returns {{registered: string[], supported: string[], missing: string[]}}
 */
export function describeRegistry() {
  const registered = listRegisteredSourceTypes();
  const supported = listSupportedSourceTypes();
  const missing = supported.filter((type) => !registered.includes(type));

  return { registered, supported, missing };
}

export const SOURCE_REGISTRY = Object.freeze({
  SOURCE_TYPES,
});