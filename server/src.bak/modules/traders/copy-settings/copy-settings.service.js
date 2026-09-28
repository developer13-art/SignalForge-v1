/**
 * Copy Settings Service
 *
 * @module signalforge/server/modules/traders/copy-settings/service
 */

import { CopySettingsRepository } from './repository.js';
import { FollowerNotFoundError, InvalidCopySettingsError } from '../trader.errors.js';
import { COPY_MODES } from '../trader.constants.js';
import { emitCopySettingsUpdated } from '../trader.events.js';

const DEFAULTS = Object.freeze({
  copyMode: COPY_MODES.PROPORTIONAL,
  fixedLot: null,
  percentage: 100,
  lotMultiplier: 1.0,
  maxLotSize: 100,
  minLotSize: 0.01,
  maxDailyTrades: 50,
  copyStopLoss: true,
  copyTakeProfit: true,
  copyPartialClose: true,
  copyTrailingStop: true,
});

export class CopySettingsService {
  constructor(repository = null) {
    this.repository = repository || new CopySettingsRepository();
  }

  async getSettings(traderId, followerUserId) {
    const row = await this.repository.find(traderId, followerUserId);
    if (!row) {
      throw new FollowerNotFoundError();
    }
    return this.serialize(row);
  }

  async updateSettings(traderId, followerUserId, payload) {
    const row = await this.repository.find(traderId, followerUserId);
    if (!row) {
      throw new FollowerNotFoundError();
    }

    this.validateCombination({ ...this.serialize(row), ...payload });

    await this.repository.update(row.id, payload);
    const updated = await this.repository.findById(row.id);
    await emitCopySettingsUpdated(traderId, followerUserId, Object.keys(payload));
    return this.serialize(updated);
  }

  validateCombination(settings) {
    if (settings.copyMode === COPY_MODES.FIXED_LOT) {
      if (!settings.fixedLot || Number(settings.fixedLot) <= 0) {
        throw new InvalidCopySettingsError('fixedLot is required for FIXED_LOT mode');
      }
    }
    if (settings.copyMode === COPY_MODES.PERCENTAGE) {
      if (!settings.percentage || Number(settings.percentage) <= 0) {
        throw new InvalidCopySettingsError('percentage is required for PERCENTAGE mode');
      }
    }
    if (
      settings.minLotSize &&
      settings.maxLotSize &&
      Number(settings.minLotSize) > Number(settings.maxLotSize)
    ) {
      throw new InvalidCopySettingsError('minLotSize cannot be greater than maxLotSize');
    }
  }

  getDefaults() {
    return { ...DEFAULTS };
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      traderId: row.trader_id,
      followerId: row.follower_id,
      status: row.status,
      copyMode: row.copy_mode || DEFAULTS.copyMode,
      fixedLot: row.fixed_lot ?? DEFAULTS.fixedLot,
      percentage: row.percentage ?? DEFAULTS.percentage,
      lotMultiplier: row.lot_multiplier ?? DEFAULTS.lotMultiplier,
      maxLotSize: row.max_lot_size ?? DEFAULTS.maxLotSize,
      minLotSize: row.min_lot_size ?? DEFAULTS.minLotSize,
      maxDailyTrades: row.max_daily_trades ?? DEFAULTS.maxDailyTrades,
      copyStopLoss: row.copy_stop_loss ?? DEFAULTS.copyStopLoss,
      copyTakeProfit: row.copy_take_profit ?? DEFAULTS.copyTakeProfit,
      copyPartialClose: row.copy_partial_close ?? DEFAULTS.copyPartialClose,
      copyTrailingStop: row.copy_trailing_stop ?? DEFAULTS.copyTrailingStop,
      brokerAccountId: row.broker_account_id,
    };
  }
}

export { DEFAULTS as COPY_SETTINGS_DEFAULTS };

export default CopySettingsService;