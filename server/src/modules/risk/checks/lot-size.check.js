/**
 * Lot Size Check
 *
 * @module signalforge/server/modules/risk/checks/lot-size
 */

import { BaseCheck } from './base.check.js';
import { RISK_CHECKS } from '../risk.constants.js';
import { emitRiskLimitHit } from '../risk.events.js';

export class LotSizeCheck extends BaseCheck {
  constructor() {
    super(RISK_CHECKS.LOT_SIZE);
  }

  async run(context) {
    const { profile, userId, signal, calculatedVolume } = context;

    if (!profile || !profile.max_lot_size || profile.max_lot_size <= 0) {
      return this.pass();
    }

    const volume = calculatedVolume ?? signal?.lotSize;

    if (volume === undefined || volume === null) {
      return this.skip('NO_VOLUME');
    }

    if (Number(volume) > profile.max_lot_size) {
      await emitRiskLimitHit(userId, 'LOT_SIZE', {
        requested: volume,
        max: profile.max_lot_size,
      });
      return this.fail(
        `Volume ${volume} exceeds maximum lot size ${profile.max_lot_size}`,
        { requestedVolume: Number(volume), maxLotSize: profile.max_lot_size },
      );
    }

    return this.pass({
      requestedVolume: Number(volume),
      maxLotSize: profile.max_lot_size,
    });
  }
}

export default LotSizeCheck;