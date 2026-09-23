/**
 * Lot Scaling Service
 *
 * @module signalforge/server/modules/copy-trading/scaling/lot
 */

import { FixedLotService } from './fixed-lot.service.js';
import { PercentageScalingService } from './percentage-scaling.service.js';
import { BalanceScalingService } from './balance-scaling.service.js';
import { EquityScalingService } from './equity-scaling.service.js';
import { SCALING_MODES, SCALING_MODE_VALUES } from '../copy-trading.constants.js';
import { InvalidScalingModeError } from '../copy-trading.errors.js';

const DEFAULT_RATIO_MODE = SCALING_MODES.PERCENTAGE;

export class LotScalingService {
  constructor(dependencies = {}) {
    this.fixedLot = dependencies.fixedLot || new FixedLotService();
    this.percentage = dependencies.percentage || new PercentageScalingService();
    this.balance = dependencies.balance || new BalanceScalingService();
    this.equity = dependencies.equity || new EquityScalingService();
  }

  calculate(subscription, providerTrade, accountSnapshot = null, options = {}) {
    const mode = subscription.scaling_mode || DEFAULT_RATIO_MODE;

    if (!SCALING_MODE_VALUES.includes(mode)) {
      throw new InvalidScalingModeError(undefined, { mode });
    }

    switch (mode) {
      case SCALING_MODES.FIXED_LOT:
        return this.fixedLot.calculate(subscription, providerTrade, options);
      case SCALING_MODES.PERCENTAGE:
        return this.percentage.calculate(subscription, providerTrade, options);
      case SCALING_MODES.BALANCE_BASED:
        return this.balance.calculate(subscription, providerTrade, accountSnapshot, options);
      case SCALING_MODES.EQUITY_BASED:
        return this.equity.calculate(subscription, providerTrade, accountSnapshot, options);
      case SCALING_MODES.PROVIDER_RATIO:
        return this.percentage.calculate(subscription, providerTrade, {
          ...options,
          percentage: 100,
        });
      default:
        throw new InvalidScalingModeError(undefined, { mode });
    }
  }
}

export default LotScalingService;