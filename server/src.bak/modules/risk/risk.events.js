/**
 * Risk Event Helpers
 *
 * @module signalforge/server/modules/risk/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { RISK_EVENTS } from './risk.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'risk',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitRiskCheckStarted(signalId, userId, meta = {}) {
  return publish(RISK_EVENTS.RISK_CHECK_STARTED, {
    signalId,
    userId,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRiskCheckCompleted(signalId, userId, result, meta = {}) {
  return publish(RISK_EVENTS.RISK_CHECK_COMPLETED, {
    signalId,
    userId,
    decision: result.decision,
    durationMs: result.durationMs,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRiskCheckFailed(signalId, userId, checkName, reason, meta = {}) {
  return publish(RISK_EVENTS.RISK_CHECK_FAILED, {
    signalId,
    userId,
    checkName,
    reason,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRiskApproved(signalId, userId, decision, meta = {}) {
  return publish(RISK_EVENTS.RISK_APPROVED, {
    signalId,
    userId,
    approvedVolume: decision.approvedVolume,
    approvedRiskPercent: decision.approvedRiskPercent,
    approvedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRiskRejected(signalId, userId, failedChecks, meta = {}) {
  return publish(RISK_EVENTS.RISK_REJECTED, {
    signalId,
    userId,
    failedChecks,
    rejectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRiskRequiresReview(signalId, userId, reasons, meta = {}) {
  return publish(RISK_EVENTS.RISK_REQUIRES_REVIEW, {
    signalId,
    userId,
    reasons,
    flaggedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRiskProfileCreated(userId, profileId, meta = {}) {
  return publish(RISK_EVENTS.RISK_PROFILE_CREATED, {
    userId,
    profileId,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRiskProfileUpdated(userId, profileId, changes, meta = {}) {
  return publish(RISK_EVENTS.RISK_PROFILE_UPDATED, {
    userId,
    profileId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRiskLimitHit(userId, limitType, details, meta = {}) {
  return publish(RISK_EVENTS.RISK_LIMIT_HIT, {
    userId,
    limitType,
    details,
    hitAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRiskEmergencyStop(userId, reason, meta = {}) {
  return publish(RISK_EVENTS.RISK_EMERGENCY_STOP, {
    userId,
    reason,
    stoppedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRiskDailyLossExceeded(userId, loss, limit, meta = {}) {
  return publish(RISK_EVENTS.RISK_DAILY_LOSS_EXCEEDED, {
    userId,
    loss,
    limit,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRiskDrawdownExceeded(userId, drawdown, limit, meta = {}) {
  return publish(RISK_EVENTS.RISK_DRAWDOWN_EXCEEDED, {
    userId,
    drawdown,
    limit,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRiskNewsFilterBlocked(userId, symbol, newsEvent, meta = {}) {
  return publish(RISK_EVENTS.RISK_NEWS_FILTER_BLOCKED, {
    userId,
    symbol,
    newsEvent,
    blockedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRiskSessionBlocked(userId, symbol, meta = {}) {
  return publish(RISK_EVENTS.RISK_SESSION_BLOCKED, {
    userId,
    symbol,
    blockedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRiskCorrelationBlocked(userId, symbol, exposures, meta = {}) {
  return publish(RISK_EVENTS.RISK_CORRELATION_BLOCKED, {
    userId,
    symbol,
    exposures,
    blockedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRiskMarginInsufficient(userId, required, available, meta = {}) {
  return publish(RISK_EVENTS.RISK_MARGIN_INSUFFICIENT, {
    userId,
    required,
    available,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRiskSpreadTooWide(userId, symbol, spread, limit, meta = {}) {
  return publish(RISK_EVENTS.RISK_SPREAD_TOO_WIDE, {
    userId,
    symbol,
    spread,
    limit,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRiskSlippageExceeded(userId, symbol, slippage, limit, meta = {}) {
  return publish(RISK_EVENTS.RISK_SLIPPAGE_EXCEEDED, {
    userId,
    symbol,
    slippage,
    limit,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export { RISK_EVENTS }; 