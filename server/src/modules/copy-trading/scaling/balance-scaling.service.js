/**
 * Balance-Based Scaling Service
 *
 * @module signalforge/server/modules/copy-trading/scaling/balance
 */

import { DEFAULT_MIN_LOT_SIZE, DEFAULT_MAX_LOT_SIZE, DEFAULT_LOT_STEP } from '../copy-trading.constants.js';
import { ScalingCalculationError } from '../copy-trading.errors.js';

export class BalanceScalingService {
  calculate(subscription, providerTrade, accountSnapshot, options = {}) {
    const providerVolume = Number(providerTrade?.volume);
    if (!Number.isFinite(providerVolume) || providerVolume <= 0) {
      throw new ScalingCalculationError('Provider volume is invalid', { providerVolume });
    }

    if (!accountSnapshot || !Number.isFinite(Number(accountSnapshot.balance))) {
      throw new ScalingCalculationError('Account snapshot is invalid');
    }

    const balance = Number(accountSnapshot.balance);
    if (balance <= 0) {
      throw new ScalingCalculationError('Account balance must be positive', { balance });
    }

    const referenceBalance =
      Number(subscription.reference_balance) ||
      Number(options.referenceBalance) ||
      10000;

    const percentage = Number(subscription.percentage) || 100;

    const ratio = balance / referenceBalance;
    const rawVolume = providerVolume * ratio * (percentage / 100);
    const multiplier = Number(subscription.lot_multiplier) || 1;
    const multiplied = rawVolume * multiplier;

    const minLot = options.minLotSize ?? subscription.min_lot_size ?? DEFAULT_MIN_LOT_SIZE;
    const maxLot = options.maxLotSize ?? subscription.max_lot_size ?? DEFAULT_MAX_LOT_SIZE;
    const step = options.lotStep ?? DEFAULT_LOT_STEP;

    let volume = Math.round(multiplied / step) * step;
    volume = Math.max(minLot, Math.min(maxLot, volume));

    return {
      mode: 'BALANCE_BASED',
      volume: Number(volume.toFixed(2)),
      originalVolume: Number(rawVolume.toFixed(2)),
      providerVolume: Number(providerVolume.toFixed(2)),
      balance,
      referenceBalance,
      ratio: Number(ratio.toFixed(4)),
      multiplier,
    };
  }
}

export default BalanceScalingService;