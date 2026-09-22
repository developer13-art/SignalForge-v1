/**
 * Order Types
 *
 * Defines the order types supported by SignalForge for trade execution
 * via MetaApi and future broker adapters.
 *
 * @module @signalforge/shared/constants/order-types
 */

export const ORDER_TYPES = Object.freeze({
  MARKET: 'MARKET',
  LIMIT: 'LIMIT',
  STOP: 'STOP',
  STOP_LIMIT: 'STOP_LIMIT',
});

export const ORDER_TYPE_VALUES = Object.freeze(Object.values(ORDER_TYPES));

export const ORDER_TYPE_LABELS = Object.freeze({
  [ORDER_TYPES.MARKET]: 'Market Order',
  [ORDER_TYPES.LIMIT]: 'Limit Order',
  [ORDER_TYPES.STOP]: 'Stop Order',
  [ORDER_TYPES.STOP_LIMIT]: 'Stop Limit Order',
});

export const ENTRY_TYPES = Object.freeze({
  MARKET: 'MARKET',
  PENDING: 'PENDING',
  LIMIT: 'LIMIT',
  STOP: 'STOP',
});

export const ENTRY_TYPE_VALUES = Object.freeze(Object.values(ENTRY_TYPES));

export function isValidOrderType(type) {
  return ORDER_TYPE_VALUES.includes(type);
}

export function isValidEntryType(type) {
  return ENTRY_TYPE_VALUES.includes(type);
}