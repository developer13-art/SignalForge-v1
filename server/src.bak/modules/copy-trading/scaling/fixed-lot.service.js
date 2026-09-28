/**
 * Fixed Lot Scaling Service
 *
 * @module signalforge/server/modules/copy-trading/scaling/fixed-lot
 */

import { DEFAULT_MIN_LOT_SIZE, DEFAULT_MAX_LOT_SIZE, DEFAULT_LOT_STEP } from '../copy-trading.constants.js';
import { ScalingCalculationError } from '../copy-trading.errors.js';

export class FixedLotService {
  calculate(subscription, providerTrade, options = {}) {
    const fixedLot = Number(subscription.fixed_lot);
    if (!Number.isFinite(fixedLot) || fixedLot <= 0) {
      throw new ScalingCalculationError('Fixed lot is not configured', {
        fixedLot: subscription.fixed_lot,
      });
    }

    const minLot = options.minLotSize ?? subscription.min_lot_size ?? DEFAULT_MIN_LOT_SIZE;
    const maxLot = options.maxLotSize ?? subscription.max_lot_size ?? DEFAULT_MAX_LOT_SIZE;
    const step = options.lotStep ?? DEFAULT_LOT_STEP;

    let volume = Math.round(fixedLot / step) * step;
    volume = Math.max(minLot, Math.min(maxLot, volume));

    return {
      mode: 'FIXED_LOT',
      volume: Number(volume.toFixed(2)),
      originalVolume: Number(fixedLot.toFixed(2)),
      providerVolume: Number(providerTrade?.volume || 0),
      multiplier: 1,
    };
  }
}

export default FixedLotService;