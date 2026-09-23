/**
 * Risk Decision Service
 *
 * Orchestrates the risk check pipeline for a signal.
 *
 * @module signalforge/server/modules/risk/decision/service
 */

import { DecisionRepository } from './decision.repository.js';
import { CheckRegistry } from '../checks/check.registry.js';
import { RiskProfileService } from '../profile/risk-profile.service.js';
import { PositionSizeService } from '../calculator/position-size.service.js';
import {
  RISK_DECISIONS,
  getRiskCheckSeverity,
} from '../risk.constants.js';
import {
  emitRiskCheckStarted,
  emitRiskCheckCompleted,
  emitRiskCheckFailed,
  emitRiskApproved,
  emitRiskRejected,
  emitRiskRequiresReview,
} from '../risk.events.js';

export class DecisionService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new DecisionRepository();
    this.profileService = dependencies.profileService || new RiskProfileService();
    this.positionSize = dependencies.positionSize || new PositionSizeService();
    this.checks = dependencies.checks || CheckRegistry.createAll(dependencies);
  }

  async evaluate(signal, context = {}) {
    const userId = context.userId;
    if (!userId) {
      throw new Error('UserId is required for risk evaluation');
    }

    const start = Date.now();
    await emitRiskCheckStarted(signal.signalId, userId, {
      brokerAccountId: context.brokerAccountId || null,
    });

    const profile = await this.profileService.getOrCreate(userId, context.brokerAccountId || null);

    if (profile.emergencyStopActive) {
      const rejection = {
        decision: RISK_DECISIONS.REJECTED,
        reason: 'Emergency stop is active',
        failedChecks: ['EMERGENCY_STOP'],
      };
      await this.persistDecision(signal, context, profile, rejection, Date.now() - start);
      await emitRiskRejected(signal.signalId, userId, ['EMERGENCY_STOP']);
      return rejection;
    }

    const runtimeProfile = this.mapProfileToRuntime(profile);
    const calculatedVolume = this.calculateVolume(runtimeProfile, context, signal);

    const checkContext = {
      userId,
      brokerAccountId: context.brokerAccountId || null,
      profile: runtimeProfile,
      signal,
      accountSnapshot: context.accountSnapshot || null,
      recentTrades: context.recentTrades || null,
      requiredMargin: context.requiredMargin ?? null,
      currentSpread: context.currentSpread ?? null,
      estimatedSlippage: context.estimatedSlippage ?? null,
      calculatedVolume,
      referenceTime: context.referenceTime || new Date(),
    };

    const checks = [];

    for (const check of this.checks) {
      let result;
      try {
        result = await check.run(checkContext);
      } catch (error) {
        result = {
          name: check.name,
          passed: false,
          reason: `Check error: ${error.message}`,
        };
      }
      checks.push(result);

      if (!result.passed && !result.skipped) {
        await emitRiskCheckFailed(signal.signalId, userId, check.name, result.reason);
      }
    }

    const failedChecks = checks.filter((c) => !c.passed && !c.skipped);
    const criticalFailures = failedChecks.filter(
      (c) => getRiskCheckSeverity(c.name) === 'CRITICAL',
    );

    let decision;
    let reason = null;

    if (criticalFailures.length > 0) {
      decision = RISK_DECISIONS.REJECTED;
      reason = criticalFailures.map((c) => `${c.name}: ${c.reason}`).join('; ');
    } else if (failedChecks.length > 0) {
      const allLowSeverity = failedChecks.every(
        (c) => getRiskCheckSeverity(c.name) === 'LOW',
      );
      decision = allLowSeverity ? RISK_DECISIONS.APPROVED : RISK_DECISIONS.REJECTED;
      if (!allLowSeverity) {
        reason = failedChecks.map((c) => `${c.name}: ${c.reason}`).join('; ');
      }
    } else {
      decision = RISK_DECISIONS.APPROVED;
    }

    const durationMs = Date.now() - start;

    const result = {
      decision,
      reason,
      checks,
      failedChecks: failedChecks.map((c) => c.name),
      approvedVolume: decision === RISK_DECISIONS.APPROVED ? calculatedVolume?.volume ?? null : null,
      approvedRiskPercent:
        decision === RISK_DECISIONS.APPROVED ? runtimeProfile.riskPercent : null,
      durationMs,
    };

    await this.persistDecision(signal, context, profile, result, durationMs);

    if (decision === RISK_DECISIONS.APPROVED) {
      await emitRiskApproved(signal.signalId, userId, result);
    } else if (decision === RISK_DECISIONS.REJECTED) {
      await emitRiskRejected(signal.signalId, userId, result.failedChecks);
    } else {
      await emitRiskRequiresReview(signal.signalId, userId, [reason]);
    }

    await emitRiskCheckCompleted(signal.signalId, userId, result, {
      brokerAccountId: context.brokerAccountId || null,
    });

    return result;
  }

  calculateVolume(profile, context, signal) {
    if (!context.accountSnapshot || !context.accountSnapshot.balance) {
      return null;
    }
    const entryPrice = signal.entryPrice;
    const stopLoss = signal.stopLoss;
    if (!entryPrice || !stopLoss) {
      return null;
    }
    try {
      return this.positionSize.calculate({
        balance: context.accountSnapshot.balance,
        riskPercent: profile.riskPercent,
        symbol: signal.normalizedSymbol || signal.symbol,
        entryPrice,
        stopLoss,
      });
    } catch {
      return null;
    }
  }

  async persistDecision(signal, context, profile, result, durationMs) {
    try {
      return await this.repository.create({
        signalId: signal.signalId,
        userId: context.userId,
        brokerAccountId: context.brokerAccountId || null,
        profileId: profile.id,
        decision: result.decision,
        approvedVolume: result.approvedVolume ?? null,
        approvedRiskPercent: result.approvedRiskPercent ?? null,
        checks: result.checks || null,
        failedChecks: result.failedChecks || null,
        reason: result.reason || null,
        durationMs,
      });
    } catch (error) {
      return null;
    }
  }

  mapProfileToRuntime(profile) {
    return {
      id: profile.id,
      userId: profile.userId,
      brokerAccountId: profile.brokerAccountId,
      riskPercent: profile.riskPercent,
      max_daily_loss: profile.maxDailyLoss,
      max_drawdown_percent: profile.maxDrawdownPercent,
      max_open_trades: profile.maxOpenTrades,
      max_lot_size: profile.maxLotSize,
      max_spread_pips: profile.maxSpreadPips,
      max_slippage_pips: profile.maxSlippagePips,
      news_filter_enabled: profile.newsFilterEnabled,
      news_filter_minutes_before: profile.newsFilterMinutesBefore,
      news_filter_minutes_after: profile.newsFilterMinutesAfter,
      correlation_protection_enabled: profile.correlationProtectionEnabled,
      max_correlated_positions: profile.maxCorrelatedPositions,
      trading_sessions: profile.tradingSessions,
      blocked_symbols: profile.blockedSymbols,
      allowed_symbols: profile.allowedSymbols,
      blocked_providers: profile.blockedProviders,
      allowed_providers: profile.allowedProviders,
      emergency_stop_active: profile.emergencyStopActive,
    };
  }

  async getById(decisionId) {
    const row = await this.repository.findById(decisionId);
    return this.serialize(row);
  }

  async listBySignal(signalId) {
    const rows = await this.repository.findBySignal(signalId);
    return rows.map((r) => this.serialize(r));
  }

  async list(filters, pagination) {
    const result = await this.repository.list(filters, pagination);
    return {
      decisions: result.decisions.map((d) => this.serialize(d)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async stats(filters) {
    return this.repository.countByResult(filters);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      signalId: row.signal_id,
      tradeId: row.trade_id,
      userId: row.user_id,
      brokerAccountId: row.broker_account_id,
      profileId: row.profile_id,
      decision: row.decision,
      approvedVolume: row.approved_volume,
      approvedRiskPercent: row.approved_risk_percent,
      checks: row.checks,
      failedChecks: row.failed_checks,
      reason: row.reason,
      durationMs: row.duration_ms,
      createdAt: row.created_at,
    };
  }
}

export default DecisionService;