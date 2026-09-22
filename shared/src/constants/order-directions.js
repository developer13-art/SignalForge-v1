/**
 * Order Directions
 *
 * Defines the trade directions supported by SignalForge.
 *
 * @module @signalforge/shared/constants/order-directions
 */

export const ORDER_DIRECTIONS = Object.freeze({
  BUY: 'BUY',
  SELL: 'SELL',
});

export const ORDER_DIRECTION_VALUES = Object.freeze(Object.values(ORDER_DIRECTIONS));

export const ORDER_DIRECTION_LABELS = Object.freeze({
  [ORDER_DIRECTIONS.BUY]: 'Buy',
  [ORDER_DIRECTIONS.SELL]: 'Sell',
});

export const DIRECTION_ALIASES = Object.freeze({
  BUY: 'BUY',
  LONG: 'BUY',
  BULLISH: 'BUY',
  SELL: 'SELL',
  SHORT: 'SELL',
  BEARISH: 'SELL',
});

export function normalizeDirection(input) {
  if (!input) {
    return null;
  }
  const upper = String(input).trim().toUpperCase();
  return DIRECTION_ALIASES[upper] || null;
}

export function isValidDirection(direction) {
  return ORDER_DIRECTION_VALUES.includes(direction);
}