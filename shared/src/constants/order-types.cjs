/**
 * Order Types
 *
 * Defines the order types supported by SignalForge for trade execution
 * via MetaApi and future broker adapters.
 *
 * @module @signalforge/shared/constants/order-types
 */const ORDER_TYPES = Object.freeze({
  MARKET: 'MARKET',
  LIMIT: 'LIMIT',
  STOP: 'STOP',
  STOP_LIMIT: 'STOP_LIMIT',
});const ORDER_TYPE_VALUES = Object.freeze(Object.values(ORDER_TYPES));const ORDER_TYPE_LABELS = Object.freeze({
  [ORDER_TYPES.MARKET]: 'Market Order',
  [ORDER_TYPES.LIMIT]: 'Limit Order',
  [ORDER_TYPES.STOP]: 'Stop Order',
  [ORDER_TYPES.STOP_LIMIT]: 'Stop Limit Order',
});const ENTRY_TYPES = Object.freeze({
  MARKET: 'MARKET',
  PENDING: 'PENDING',
  LIMIT: 'LIMIT',
  STOP: 'STOP',
});const ENTRY_TYPE_VALUES = Object.freeze(Object.values(ENTRY_TYPES));function isValidOrderType(type) {
  return ORDER_TYPE_VALUES.includes(type);
}function isValidEntryType(type) {
  return ENTRY_TYPE_VALUES.includes(type);
}

module.exports.isValidOrderType = isValidOrderType;
module.exports.isValidEntryType = isValidEntryType;
module.exports.ORDER_TYPES = ORDER_TYPES;
module.exports.ORDER_TYPE_VALUES = ORDER_TYPE_VALUES;
module.exports.ORDER_TYPE_LABELS = ORDER_TYPE_LABELS;
module.exports.ENTRY_TYPES = ENTRY_TYPES;
module.exports.ENTRY_TYPE_VALUES = ENTRY_TYPE_VALUES;
