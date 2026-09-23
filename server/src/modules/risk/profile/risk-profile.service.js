/**
 * Risk Profile Service
 *
 * @module signalforge/server/modules/risk/profile/service
 */

import { RiskProfileRepository } from './risk-profile.repository.js';
import { RiskRepository } from '../risk.repository.js';
import { RISK_PROFILE_DEFAULTS } from '../risk.constants.js';
import { RiskProfileNotFoundError } from '../risk.errors.js';
import {
  emitRiskProfileCreated,
  emitRiskProfileUpdated,
  emitRiskEmergencyStop,
} from '../risk.events.js';

export class RiskProfileService {
  constructor(repository = null, riskRepository = null) {
    this.repository = repository || new RiskProfileRepository();
    this.riskRepository = riskRepository || new RiskRepository();
  }

  async getOrCreate(userId, brokerAccountId = null) {
    const existing = brokerAccountId
      ? await this.repository.findByUserAndAccount(userId, brokerAccountId)
      : await this.repository.findByUserId(userId);

    if (existing) {
      return this.serialize(existing);
    }

    const created = await this.repository.create({
      userId,
      brokerAccountId,
      ...RISK_PROFILE_DEFAULTS,
    });

    await emitRiskProfileCreated(userId, created.id);

    const full = await this.repository.findById(created.id);
    return this.serialize(full);
  }

  async getById(userId, profileId) {
    const profile = await this.repository.findById(profileId);
    if (!profile || profile.user_id !== userId) {
      throw new RiskProfileNotFoundError();
    }
    return this.serialize(profile);
  }

  async update(userId, profileId, payload) {
    const profile = await this.repository.findById(profileId);
    if (!profile || profile.user_id !== userId) {
      throw new RiskProfileNotFoundError();
    }
    await this.repository.update(profileId, payload);
    const updated = await this.repository.findById(profileId);
    await emitRiskProfileUpdated(userId, profileId, Object.keys(payload));
    return this.serialize(updated);
  }

  async activateEmergencyStop(userId, profileId, reason) {
    const profile = await this.repository.findById(profileId);
    if (!profile || profile.user_id !== userId) {
      throw new RiskProfileNotFoundError();
    }
    await this.repository.update(profileId, {
      emergencyStopActive: true,
    });
    await emitRiskEmergencyStop(userId, reason);
    const updated = await this.repository.findById(profileId);
    return this.serialize(updated);
  }

  async deactivateEmergencyStop(userId, profileId) {
    const profile = await this.repository.findById(profileId);
    if (!profile || profile.user_id !== userId) {
      throw new RiskProfileNotFoundError();
    }
    await this.repository.update(profileId, {
      emergencyStopActive: false,
    });
    const updated = await this.repository.findById(profileId);
    return this.serialize(updated);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      brokerAccountId: row.broker_account_id,
      riskPercent: row.risk_percent,
      maxDailyLoss: row.max_daily_loss,
      maxDrawdownPercent: row.max_drawdown_percent,
      maxOpenTrades: row.max_open_trades,
      maxLotSize: row.max_lot_size,
      maxSpreadPips: row.max_spread_pips,
      maxSlippagePips: row.max_slippage_pips,
      trailingStopEnabled: row.trailing_stop_enabled,
      trailingStopPips: row.trailing_stop_pips,
      breakEvenEnabled: row.break_even_enabled,
      breakEvenPips: row.break_even_pips,
      profitLockEnabled: row.profit_lock_enabled,
      profitLockPips: row.profit_lock_pips,
      partialCloseEnabled: row.partial_close_enabled,
      partialClosePercent: row.partial_close_percent,
      correlationProtectionEnabled: row.correlation_protection_enabled,
      maxCorrelatedPositions: row.max_correlated_positions,
      newsFilterEnabled: row.news_filter_enabled,
      newsFilterMinutesBefore: row.news_filter_minutes_before,
      newsFilterMinutesAfter: row.news_filter_minutes_after,
      emergencyStopEnabled: row.emergency_stop_enabled,
      emergencyStopActive: row.emergency_stop_active,
      allowedSymbols: row.allowed_symbols,
      blockedSymbols: row.blocked_symbols,
      allowedProviders: row.allowed_providers,
      blockedProviders: row.blocked_providers,
      tradingSessions: row.trading_sessions,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default RiskProfileService;