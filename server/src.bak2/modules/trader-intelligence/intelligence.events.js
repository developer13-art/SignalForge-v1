/**
 * Trader Intelligence Event Helpers
 *
 * @module signalforge/server/modules/trader-intelligence/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { INTELLIGENCE_EVENTS } = require('./intelligence.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'trader-intelligence',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitAnalysisStarted(userId, window, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.ANALYSIS_STARTED, {
    userId,
    window,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitAnalysisCompleted(userId, window, summary, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.ANALYSIS_COMPLETED, {
    userId,
    window,
    summary,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitAnalysisFailed(userId, window, error, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.ANALYSIS_FAILED, {
    userId,
    window,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitClassificationUpdated(userId, window, classification, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.CLASSIFICATION_UPDATED, {
    userId,
    window,
    classification,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitStyleClassified(userId, style, confidence, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.STYLE_CLASSIFIED, {
    userId,
    style,
    confidence,
    classifiedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRiskClassified(userId, riskStyle, score, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.RISK_CLASSIFIED, {
    userId,
    riskStyle,
    score,
    classifiedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitBehaviorClassified(userId, behaviorCategory, score, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.BEHAVIOR_CLASSIFIED, {
    userId,
    behaviorCategory,
    score,
    classifiedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitTimelineUpdated(userId, eventType, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.TIMELINE_UPDATED, {
    userId,
    eventType,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitMartingaleDetected(userId, score, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.MARTINGALE_DETECTED, {
    userId,
    score,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitGridDetected(userId, score, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.GRID_DETECTED, {
    userId,
    score,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRecoveryTradingDetected(userId, score, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.RECOVERY_TRADING_DETECTED, {
    userId,
    score,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitNewsOverexposureDetected(userId, score, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.NEWS_OVEREXPOSURE_DETECTED, {
    userId,
    score,
    detectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitDisciplineAlert(userId, alert, meta = {}) {
  return publish(INTELLIGENCE_EVENTS.DISCIPLINE_ALERT, {
    userId,
    alert,
    raisedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitAnalysisStarted = emitAnalysisStarted;
module.exports.emitAnalysisCompleted = emitAnalysisCompleted;
module.exports.emitAnalysisFailed = emitAnalysisFailed;
module.exports.emitClassificationUpdated = emitClassificationUpdated;
module.exports.emitStyleClassified = emitStyleClassified;
module.exports.emitRiskClassified = emitRiskClassified;
module.exports.emitBehaviorClassified = emitBehaviorClassified;
module.exports.emitTimelineUpdated = emitTimelineUpdated;
module.exports.emitMartingaleDetected = emitMartingaleDetected;
module.exports.emitGridDetected = emitGridDetected;
module.exports.emitRecoveryTradingDetected = emitRecoveryTradingDetected;
module.exports.emitNewsOverexposureDetected = emitNewsOverexposureDetected;
module.exports.emitDisciplineAlert = emitDisciplineAlert;
