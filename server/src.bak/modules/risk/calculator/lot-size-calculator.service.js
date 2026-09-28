/**
 * Lot Size Calculator Service
 *
 * @module signalforge/server/modules/risk/calculator/lot-size
 */

import { PipValueService } from './pip-value.service.js';

export class LotSizeCalculatorService {
  constructor(pipValueService = null) {
    this.pipValue = pipValueService || new PipValueService();
  }

  calculate({ balance, riskPercent, symbol, entryPrice, stopLoss, pipValuePerLot }) {
    if (!balance || !riskPercent || !entryPrice || !stopLoss) {
      return null;
    }

    const riskAmount = (Number(balance) * Number(riskPercent)) / 100;
    const stopLossPips = this.pipValue.calculateDistanceInPips(symbol, entryPrice, stopLoss);

    if (stopLossPips <= 0) {
      return null;
    }

    const perLot = pipValuePerLot ?? this.pipValue.getPipValuePerLot(symbol, entryPrice);
    if (!perLot || perLot <= 0) {
      return null;
    }

    const volume = riskAmount / (stopLossPips * perLot);

    return {
      volume: Number(volume.toFixed(4)),
      riskAmount: Number(riskAmount.toFixed(4)),
      stopLossPips: Number(stopLossPips.toFixed(4)),
      pipValuePerLot: perLot,
    };
  }
}

export default LotSizeCalculatorService;