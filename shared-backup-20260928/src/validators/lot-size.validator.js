/**
 * Lot Size Validator
 *
 * Provides validation for trading volumes expressed in lots. Enforces
 * step size compatibility with common broker specifications.
 *
 * @module @signalforge/shared/validators/lot-size
 */

const MIN_VOLUME = 0.01;
const MAX_VOLUME = 1000;
const DEFAULT_STEP = 0.01;function isValidVolume(volume) {
  if (typeof volume === 'number') {
    if (!Number.isFinite(volume)) {
      return false;
    }
    return volume >= MIN_VOLUME && volume <= MAX_VOLUME;
  }

  if (typeof volume === 'string') {
    const parsed = Number(volume.trim());
    if (!Number.isFinite(parsed)) {
      return false;
    }
    return parsed >= MIN_VOLUME && parsed <= MAX_VOLUME;
  }

  return false;
}function parseVolume(volume) {
  if (typeof volume === 'number') {
    return Number.isFinite(volume) ? volume : null;
  }

  if (typeof volume === 'string') {
    const parsed = Number(volume.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}function roundToStep(volume, step = DEFAULT_STEP) {
  const parsed = parseVolume(volume);
  if (parsed === null) {
    return null;
  }
  if (step <= 0) {
    return parsed;
  }
  const precision = countStepDecimals(step);
  const rounded = Math.round(parsed / step) * step;
  return Number(rounded.toFixed(precision));
}function countStepDecimals(step) {
  const str = step.toString();
  if (str.includes('e') || str.includes('E')) {
    return 8;
  }
  const dotIndex = str.indexOf('.');
  if (dotIndex === -1) {
    return 0;
  }
  return str.length - dotIndex - 1;
}function isOnStep(volume, step = DEFAULT_STEP) {
  const parsed = parseVolume(volume);
  if (parsed === null || step <= 0) {
    return false;
  }
  const precision = countStepDecimals(step);
  const steps = Number((parsed / step).toFixed(precision));
  return Math.abs(steps - Math.round(steps)) < 1e-9;
}function validateVolume(volume, options = {}) {
  const errors = [];

  const parsed = parseVolume(volume);

  if (parsed === null) {
    return { valid: false, errors: ['Volume is required and must be numeric'] };
  }

  const minVolume = options.minVolume ?? MIN_VOLUME;
  const maxVolume = options.maxVolume ?? MAX_VOLUME;
  const step = options.step ?? DEFAULT_STEP;

  if (parsed < minVolume) {
    errors.push(`Volume must be at least ${minVolume}`);
  }

  if (parsed > maxVolume) {
    errors.push(`Volume must not exceed ${maxVolume}`);
  }

  if (!isOnStep(parsed, step)) {
    errors.push(`Volume must be a multiple of ${step}`);
  }

  return { valid: errors.length === 0, errors, parsed };
}function calculateVolumeForRisk({
  accountBalance,
  riskPercent,
  stopLossPips,
  pipValuePerLot,
}) {
  if (
    typeof accountBalance !== 'number' ||
    typeof riskPercent !== 'number' ||
    typeof stopLossPips !== 'number' ||
    typeof pipValuePerLot !== 'number'
  ) {
    return null;
  }

  if (accountBalance <= 0 || riskPercent <= 0 || stopLossPips <= 0 || pipValuePerLot <= 0) {
    return null;
  }

  const riskAmount = (accountBalance * riskPercent) / 100;
  const rawVolume = riskAmount / (stopLossPips * pipValuePerLot);

  return roundToStep(rawVolume, DEFAULT_STEP);
}function validateRiskPercent(riskPercent, options = {}) {
  const errors = [];
  const min = options.min ?? 0.01;
  const max = options.max ?? 10;

  if (typeof riskPercent !== 'number' || !Number.isFinite(riskPercent)) {
    return { valid: false, errors: ['Risk percent must be numeric'] };
  }

  if (riskPercent < min) {
    errors.push(`Risk percent must be at least ${min}`);
  }

  if (riskPercent > max) {
    errors.push(`Risk percent must not exceed ${max}`);
  }

  return { valid: errors.length === 0, errors };
}const VOLUME_CONSTRAINTS = Object.freeze({
  min: MIN_VOLUME,
  max: MAX_VOLUME,
  defaultStep: DEFAULT_STEP,
});

module.exports.isValidVolume = isValidVolume;
module.exports.parseVolume = parseVolume;
module.exports.roundToStep = roundToStep;
module.exports.countStepDecimals = countStepDecimals;
module.exports.isOnStep = isOnStep;
module.exports.validateVolume = validateVolume;
module.exports.calculateVolumeForRisk = calculateVolumeForRisk;
module.exports.validateRiskPercent = validateRiskPercent;
module.exports.MIN_VOLUME = MIN_VOLUME;
module.exports.MAX_VOLUME = MAX_VOLUME;
module.exports.DEFAULT_STEP = DEFAULT_STEP;
module.exports.VOLUME_CONSTRAINTS = VOLUME_CONSTRAINTS;
