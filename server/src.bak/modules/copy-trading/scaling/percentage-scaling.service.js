/**
 * Percentage Scaling Service
 *
 * @module signalforge/server/modules/copy-trading/scaling/percentage
 */

import { DEFAULT_MIN_LOT_SIZE, DEFAULT_MAX_LOT_SIZE, DEFAULT_LOT_STEP } from '../copy-trading.constants.js';
import { ScalingCalculationError } from '../copy-trading.errors.js';

export class PercentageScalingService {
  calculate(subscription, providerTrade, options = {}) {
    const percentage = Number(subscription.percentage);
    if (!Number.isFinite(percentage) || percentage <= 0) {
      throw new ScalingCalculationError('Percentage is not configured', {
        percentage: subscription.percentage,
      });
    }

    const providerVolume = Number(providerTrade?.volume);
    if (!Number.isFinite(providerVolume) || providerVolume <= 0) {
      throw new ScalingCalculationError('Provider volume is invalid', { providerVolume });
    }

    const lotMultiplier = Number(subscription.lot_multiplier) || 1;
    const rawVolume = (providerVolume * percentage) / 100;
    const multiplied = rawVolume * lotMultiplier;

    const minLot = options.minLotSize ?? subscription.min_lot_size ?? DEFAULT_MIN_LOT_SIZE;
    const maxLot = options.maxLotSize ?? subscription.max_lot_size ?? DEFAULT_MAX_LOT_SIZE;
    const step = options.lotStep ?? DEFAULT_LOT_STEP;

    let volume = Math.round(multiplied / step) * step;
    volume = Math.max(minLot, Math.min(maxLot, volume));

    return {
      mode: 'PERCENTAGE',
      volume: Number(volume.toFixed(2)),
      originalVolume: Number(rawVolume.toFixed(2)),
      providerVolume: Number(providerVolume.toFixed(2)),
      percentage,
      multiplier: lotMultiplier,
    };
  }
}

export default PercentageScalingService;