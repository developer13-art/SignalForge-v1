/**
 * Order Directions
 *
 * Defines the trade directions supported by SignalForge.
 *
 * @module @signalforge/shared/constants/order-directions
 */const ORDER_DIRECTIONS = Object.freeze({
  BUY: 'BUY',
  SELL: 'SELL',
});const ORDER_DIRECTION_VALUES = Object.freeze(Object.values(ORDER_DIRECTIONS));const ORDER_DIRECTION_LABELS = Object.freeze({
  [ORDER_DIRECTIONS.BUY]: 'Buy',
  [ORDER_DIRECTIONS.SELL]: 'Sell',
});const DIRECTION_ALIASES = Object.freeze({
  BUY: 'BUY',
  LONG: 'BUY',
  BULLISH: 'BUY',
  SELL: 'SELL',
  SHORT: 'SELL',
  BEARISH: 'SELL',
});function normalizeDirection(input) {
  if (!input) {
    return null;
  }
  const upper = String(input).trim().toUpperCase();
  return DIRECTION_ALIASES[upper] || null;
}function isValidDirection(direction) {
  return ORDER_DIRECTION_VALUES.includes(direction);
}

module.exports.normalizeDirection = normalizeDirection;
module.exports.isValidDirection = isValidDirection;
module.exports.ORDER_DIRECTIONS = ORDER_DIRECTIONS;
module.exports.ORDER_DIRECTION_VALUES = ORDER_DIRECTION_VALUES;
module.exports.ORDER_DIRECTION_LABELS = ORDER_DIRECTION_LABELS;
module.exports.DIRECTION_ALIASES = DIRECTION_ALIASES;
