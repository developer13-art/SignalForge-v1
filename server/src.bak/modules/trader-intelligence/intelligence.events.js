/**
 * Trader Intelligence Event Helpers
 *
 * @module signalforge/server/modules/trader-intelligence/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { INTELLIGENCE_EVENTS } from './intelligence.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'trader-intelligence',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitAnalysisStarted(userId, window, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.ANALYSIS_STARTED, {
    userId,
    window,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitAnalysisCompleted(userId, window, summary, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.ANALYSIS_COMPLETED, {
    userId,
    window,
    summary,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitAnalysisFailed(userId, window, error, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.ANALYSIS_FAILED, {
    userId,
    window,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitClassificationUpdated(userId, window, classification, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.CLASSIFICATION_UPDATED, {
    userId,
    window,
    classification,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitStyleClassified(userId, style, confidence, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.STYLE_CLASSIFIED, {
    userId,
    style,
    confidence,
    classifiedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRiskClassified(userId, riskStyle, score, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.RISK_CLASSIFIED, {
    userId,
    riskStyle,
    score,
    classifiedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitBehaviorClassified(userId, behaviorCategory, score, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.BEHAVIOR_CLASSIFIED, {
    userId,
    behaviorCategory,
    score,
    classifiedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitTimelineUpdated(userId, eventType, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.TIMELINE_UPDATED, {
    userId,
    eventType,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitMartingaleDetected(userId, score, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.MARTINGALE_DETECTED, {
    userId,
    score,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitGridDetected(userId, score, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.GRID_DETECTED, {
    userId,
    score,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRecoveryTradingDetected(userId, score, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.RECOVERY_TRADING_DETECTED, {
    userId,
    score,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitNewsOverexposureDetected(userId, score, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.NEWS_OVEREXPOSURE_DETECTED, {
    userId,
    score,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitDisciplineAlert(userId, alert, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.DISCIPLINE_ALERT, {
    userId,
    alert,
    raisedAt: new Date().toISOString(),
    ...meta,
  });
}

export { INTELLIGENCE_EVENTS };