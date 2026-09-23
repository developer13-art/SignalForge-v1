/**
 * Position Size Service
 *
 * @module signalforge/server/modules/risk/calculator/position-size
 */

import { LotSizeCalculatorService } from './lot-size-calculator.service.js';

const MIN_VOLUME = 0.01;
const MAX_VOLUME = 1000;
const STEP = 0.01;

export class PositionSizeService {
  constructor(lotSizeCalculator = null) {
    this.lotSizeCalculator = lotSizeCalculator || new LotSizeCalculatorService();
  }

  roundToStep(volume, step = STEP) {
    const rounded = Math.round(volume / step) * step;
    return Number(rounded.toFixed(2));
  }

  calculate(params) {
    const result = this.lotSizeCalculator.calculate(params);
    if (!result) {
      return null;
    }

    let volume = this.roundToStep(result.volume);

    if (volume < MIN_VOLUME) {
      volume = MIN_VOLUME;
    }
    if (volume > MAX_VOLUME) {
      volume = MAX_VOLUME;
    }

    return {
      ...result,
      volume,
      originalVolume: result.volume,
      clamped: volume !== result.volume,
    };
  }
}

export default PositionSizeService;