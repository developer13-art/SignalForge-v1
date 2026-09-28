/**
 * Referral Settlement Freeze Service
 *
 * @module signalforge/server/modules/referrals/settlement/freeze
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

const DEFAULT_FREEZE_HOURS = 24;

function lastDayOfMonth(year, month) {
  return new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
}

function firstDayOfMonth(year, month) {
  return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
}

export class SettlementFreezeService {
  constructor(db = null) {
    this.db = db || getDatabase();
    this.logger = getLogger('referral-freeze');
  }

  parsePeriod(settlementPeriod) {
    const [yearStr, monthStr] = settlementPeriod.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    return { year, month };
  }

  buildFreezeWindow(settlementPeriod, freezeHours = DEFAULT_FREEZE_HOURS) {
    const { year, month } = this.parsePeriod(settlementPeriod);
    const periodEnd = lastDayOfMonth(year, month);
    const freezeStartedAt = new Date(periodEnd.getTime());
    const freezeEndedAt = new Date(freezeStartedAt.getTime() + freezeHours * 60 * 60 * 1000);
    return { freezeStartedAt, freezeEndedAt };
  }

  async ensureFreezeWindow(settlementPeriod, freezeHours) {
    const { freezeStartedAt, freezeEndedAt } = this.buildFreezeWindow(
      settlementPeriod,
      freezeHours,
    );
    return { freezeStartedAt, freezeEndedAt };
  }

  isWithinFreezeWindow(settlementPeriod, referenceTime = new Date(), freezeHours = DEFAULT_FREEZE_HOURS) {
    const { freezeStartedAt, freezeEndedAt } = this.buildFreezeWindow(
      settlementPeriod,
      freezeHours,
    );
    const t = referenceTime.getTime();
    return t >= freezeStartedAt.getTime() && t <= freezeEndedAt.getTime();
  }

  getPeriodRange(settlementPeriod) {
    const { year, month } = this.parsePeriod(settlementPeriod);
    return {
      startedAt: firstDayOfMonth(year, month),
      endsAt: lastDayOfMonth(year, month),
    };
  }
}

export default SettlementFreezeService;