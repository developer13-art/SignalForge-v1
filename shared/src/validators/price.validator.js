/**
 * Price Validator
 *
 * Provides validation for financial prices used in signal parsing,
 * trade objects, and execution requests.
 *
 * @module @signalforge/shared/validators/price
 */

const MAX_PRICE = 1_000_000_000;
const MIN_PRICE = 0;
const MAX_DECIMAL_PLACES = 8;

export function isValidPrice(price) {
  if (typeof price === 'number') {
    if (!Number.isFinite(price)) {
      return false;
    }
    return price >= MIN_PRICE && price <= MAX_PRICE;
  }

  if (typeof price === 'string') {
    const parsed = Number(price.replace(/,/g, '').trim());
    if (!Number.isFinite(parsed)) {
      return false;
    }
    return parsed >= MIN_PRICE && parsed <= MAX_PRICE;
  }

  return false;
}

export function parsePrice(price) {
  if (typeof price === 'number') {
    return Number.isFinite(price) ? price : null;
  }

  if (typeof price === 'string') {
    const cleaned = price.trim().replace(/,/g, '');
    if (cleaned === '') {
      return null;
    }
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function countDecimals(price) {
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return 0;
  }
  const str = price.toString();
  if (str.includes('e') || str.includes('E')) {
    return MAX_DECIMAL_PLACES;
  }
  const dotIndex = str.indexOf('.');
  if (dotIndex === -1) {
    return 0;
  }
  return str.length - dotIndex - 1;
}

export function roundPrice(price, decimals = 5) {
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return null;
  }
  const factor = Math.pow(10, decimals);
  return Math.round(price * factor) / factor;
}

export function validatePrice(price, options = {}) {
  const errors = [];

  const parsed = parsePrice(price);

  if (parsed === null) {
    return { valid: false, errors: ['Price is required and must be numeric'] };
  }

  if (parsed < MIN_PRICE) {
    errors.push(`Price must be at least ${MIN_PRICE}`);
  }

  if (parsed > MAX_PRICE) {
    errors.push(`Price must not exceed ${MAX_PRICE}`);
  }

  if (typeof options.min === 'number' && parsed < options.min) {
    errors.push(`Price must be at least ${options.min}`);
  }

  if (typeof options.max === 'number' && parsed > options.max) {
    errors.push(`Price must not exceed ${options.max}`);
  }

  const decimalPlaces = countDecimals(parsed);
  if (decimalPlaces > MAX_DECIMAL_PLACES) {
    errors.push(`Price must not have more than ${MAX_DECIMAL_PLACES} decimal places`);
  }

  return { valid: errors.length === 0, errors, parsed };
}

export function comparePrices(a, b, tolerance = 0) {
  const parsedA = parsePrice(a);
  const parsedB = parsePrice(b);
  if (parsedA === null || parsedB === null) {
    return null;
  }
  const diff = Math.abs(parsedA - parsedB);
  if (diff <= tolerance) {
    return 0;
  }
  return parsedA > parsedB ? 1 : -1;
}

export function priceInRange(price, min, max) {
  const parsed = parsePrice(price);
  const parsedMin = parsePrice(min);
  const parsedMax = parsePrice(max);
  if (parsed === null || parsedMin === null || parsedMax === null) {
    return false;
  }
  return parsed >= parsedMin && parsed <= parsedMax;
}

export function calculatePipValue(symbol, price) {
  const parsed = parsePrice(price);
  if (parsed === null) {
    return null;
  }

  const upperSymbol = String(symbol).toUpperCase();

  if (upperSymbol.endsWith('JPY')) {
    return 0.01;
  }

  if (upperSymbol === 'XAUUSD' || upperSymbol === 'XAGUSD') {
    return 0.01;
  }

  if (upperSymbol.startsWith('BTC') || upperSymbol.startsWith('ETH')) {
    return 1;
  }

  if (
    upperSymbol === 'US30' ||
    upperSymbol === 'NAS100' ||
    upperSymbol === 'SPX500' ||
    upperSymbol === 'GER40' ||
    upperSymbol === 'UK100' ||
    upperSymbol === 'JP225'
  ) {
    return 1;
  }

  return 0.0001;
}

export function calculatePipDistance(symbol, price1, price2) {
  const pipValue = calculatePipValue(symbol, price1);
  const parsed1 = parsePrice(price1);
  const parsed2 = parsePrice(price2);

  if (pipValue === null || parsed1 === null || parsed2 === null) {
    return null;
  }

  return Math.abs(parsed1 - parsed2) / pipValue;
}

export const PRICE_CONSTRAINTS = Object.freeze({
  min: MIN_PRICE,
  max: MAX_PRICE,
  maxDecimalPlaces: MAX_DECIMAL_PLACES,
});